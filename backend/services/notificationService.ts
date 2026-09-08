import { store, broadcastSSE } from '../models/store';
import { EmergencyEvent, NotificationRecord, EmergencyContact, User } from '../../src/types';

// In-memory active cancellation timers
const activeTimers = new Map<string, NodeJS.Timeout>();

export class NotificationService {
  /**
   * Dispatches emergency notifications to all contacts for an emergency event.
   */
  static async dispatchEmergencyNotifications(event: EmergencyEvent, user: User, contacts: EmergencyContact[]) {
    const mapsLink = event.googleMapsUrl || `https://www.google.com/maps?q=${event.latitude},${event.longitude}`;
    const formattedTime = new Date(event.createdAt).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const alertMessage = `🚨 EMERGENCY ALERT\n\n${user.name} may need immediate assistance.\n\nCurrent Location:\n${mapsLink}\n\nTime:\n${formattedTime}\n\nPlease contact the user immediately.`;

    const dispatchedRecords: NotificationRecord[] = [];

    for (const contact of contacts) {
      const channels: ('SMS' | 'EMAIL' | 'PUSH')[] = [];
      if (contact.notificationPreference === 'ALL') {
        channels.push('SMS', 'EMAIL', 'PUSH');
      } else {
        channels.push(contact.notificationPreference as any);
      }

      for (const channel of channels) {
        const dest = channel === 'SMS' ? contact.phoneNumber : (channel === 'EMAIL' ? contact.email : `${contact.contactName} App Push`);
        const notifRecord: NotificationRecord = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          emergencyEventId: event.id,
          userId: user.id,
          recipientName: contact.contactName,
          recipientDestination: dest,
          channel: channel,
          messageContent: alertMessage,
          status: 'SENDING',
          providerReferenceId: `SIM_${channel}_${Math.floor(100000 + Math.random() * 900000)}`,
          sentAt: new Date().toISOString(),
        };

        store.notifications.unshift(notifRecord);
        dispatchedRecords.push(notifRecord);
      }
    }

    // Broadcast notifications queued
    broadcastSSE('NOTIFICATIONS_DISPATCHED', { eventId: event.id, count: dispatchedRecords.length });

    // Simulate asynchronous carrier delivery progression (SENDING -> SENT -> DELIVERED)
    setTimeout(() => {
      dispatchedRecords.forEach(rec => {
        const target = store.notifications.find(n => n.id === rec.id);
        if (target && target.status === 'SENDING') {
          target.status = 'SENT';
        }
      });
      broadcastSSE('NOTIFICATIONS_UPDATED', { status: 'SENT' });
    }, 1500);

    setTimeout(() => {
      dispatchedRecords.forEach(rec => {
        const target = store.notifications.find(n => n.id === rec.id);
        if (target && target.status === 'SENT') {
          target.status = 'DELIVERED';
          target.deliveredAt = new Date().toISOString();
        }
      });
      broadcastSSE('NOTIFICATIONS_UPDATED', { status: 'DELIVERED' });
    }, 3500);

    return dispatchedRecords;
  }

  /**
   * Starts the cancellation countdown timer for an emergency event.
   */
  static scheduleEmergencyCountdown(
    event: EmergencyEvent,
    user: User,
    contacts: EmergencyContact[],
    timeoutSeconds: number = 20
  ) {
    // Clear any previous timer for this event if exists
    if (activeTimers.has(event.id)) {
      clearTimeout(activeTimers.get(event.id)!);
      activeTimers.delete(event.id);
    }

    const timer = setTimeout(async () => {
      const currentEvent = store.emergencyEvents.get(event.id);
      if (currentEvent && currentEvent.status === 'PENDING_CONFIRMATION') {
        currentEvent.status = 'ACTIVE';
        currentEvent.updatedAt = new Date().toISOString();
        store.emergencyEvents.set(event.id, currentEvent);

        // Notify contacts now that countdown completed without cancellation
        await this.dispatchEmergencyNotifications(currentEvent, user, contacts);
        broadcastSSE('EMERGENCY_ACTIVATED', currentEvent);
      }
      activeTimers.delete(event.id);
    }, timeoutSeconds * 1000);

    activeTimers.set(event.id, timer);
  }

  /**
   * Cancels emergency timer and stops further notification dispatch.
   */
  static cancelEmergency(eventId: string, reason: string = 'User pressed Cancel Emergency') {
    if (activeTimers.has(eventId)) {
      clearTimeout(activeTimers.get(eventId)!);
      activeTimers.delete(eventId);
    }

    const event = store.emergencyEvents.get(eventId);
    if (!event) return null;

    event.status = 'CANCELLED';
    event.cancellationReason = reason;
    event.cancelledAt = new Date().toISOString();
    event.updatedAt = new Date().toISOString();
    store.emergencyEvents.set(eventId, event);

    // Also update device emergency button state back to READY
    const device = store.devices.get(event.deviceId);
    if (device) {
      device.emergencyButtonStatus = 'READY';
      device.buzzerActive = false;
      device.lastCommunicationAt = new Date().toISOString();
      store.devices.set(device.id, device);
    }

    // Mark any unsent notifications as cancelled/failed
    store.notifications.forEach(n => {
      if (n.emergencyEventId === eventId && n.status === 'SENDING') {
        n.status = 'FAILED';
        n.errorMessage = 'Cancelled by user during countdown period';
      }
    });

    broadcastSSE('EMERGENCY_CANCELLED', event);
    return event;
  }
}
