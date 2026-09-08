import { Response } from 'express';
import { store, broadcastSSE } from '../models/store';
import { EmergencyEvent, LocationPoint, NotificationRecord } from '../../src/types';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { persistNotificationToMongo } from '../services/mongoSync';

export class EmergencyController {
  /**
   * Retrieves emergency events history with optional status and limit filters
   */
  static async getEmergencyHistory(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'usr_001';
    const { status, limit } = req.query;

    const events: EmergencyEvent[] = [];
    for (const ev of store.emergencyEvents.values()) {
      if (req.user?.role === 'caregiver' || ev.userId === userId) {
        if (!status || ev.status === status) {
          events.push(ev);
        }
      }
    }

    // Sort newest first
    events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const maxItems = limit ? Number(limit) : 50;
    return res.json(events.slice(0, maxItems));
  }

  /**
   * Gets current active emergency if any
   */
  static async getActiveEmergency(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'usr_001';
    let activeEvent: EmergencyEvent | null = null;

    for (const ev of store.emergencyEvents.values()) {
      if ((req.user?.role === 'caregiver' || ev.userId === userId) && (ev.status === 'ACTIVE' || ev.status === 'PENDING_CONFIRMATION')) {
        activeEvent = ev;
        break;
      }
    }

    return res.json({ activeEmergency: activeEvent });
  }

  /**
   * Retrieves location tracking breadcrumbs history
   */
  static async getLocationHistory(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'usr_001';
    const { date, limit } = req.query;

    let points = store.locations.filter(loc => loc.userId === userId);

    if (date) {
      const filterDateStr = String(date);
      points = points.filter(p => p.recordedAt.startsWith(filterDateStr));
    }

    // Sort newest first
    points.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

    const maxItems = limit ? Number(limit) : 100;
    return res.json(points.slice(0, maxItems));
  }

  /**
   * Retrieves notification logs (SMS, Email, Push delivery statuses)
   */
  static async getNotifications(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'usr_001';
    const { eventId } = req.query;

    let notifs = store.notifications.filter(n => n.userId === userId || req.user?.role === 'caregiver');
    if (eventId) {
      notifs = notifs.filter(n => n.emergencyEventId === String(eventId));
    }

    notifs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
    return res.json(notifs);
  }

  /**
   * Dispatches a manual or test notification to contacts
   */
  static async sendNotification(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'usr_001';
    const { recipientName, recipientDestination, channel, messageContent, emergencyEventId } = req.body;

    if (!recipientName || !recipientDestination || !channel || !messageContent) {
      return res.status(400).json({ error: 'recipientName, recipientDestination, channel, and messageContent are required.' });
    }

    const notif: NotificationRecord = {
      id: `notif_${Date.now()}`,
      emergencyEventId: emergencyEventId || 'manual_test',
      userId,
      recipientName,
      recipientDestination,
      channel,
      messageContent,
      status: 'DELIVERED',
      providerReferenceId: `SIM_TEST_${Math.floor(100000 + Math.random() * 900000)}`,
      sentAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
    };

    store.notifications.unshift(notif);
    broadcastSSE('NOTIFICATION_SENT', notif);
    persistNotificationToMongo(notif);
    return res.status(201).json(notif);
  }

  /**
   * Retries a failed notification
   */
  static async retryNotification(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const notif = store.notifications.find(n => n.id === id);
    if (!notif) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notif.status = 'DELIVERED';
    notif.sentAt = new Date().toISOString();
    notif.deliveredAt = new Date().toISOString();
    notif.providerReferenceId = `RETRY_SIM_${Date.now()}`;
    notif.errorMessage = undefined;

    broadcastSSE('NOTIFICATION_SENT', notif);
    persistNotificationToMongo(notif);
    return res.json({ success: true, notification: notif });
  }

  /**
   * Caregiver portal: list authorized patients
   */
  static async getCaregiverPatients(req: AuthenticatedRequest, res: Response) {
    const caregiverId = req.user?.id || 'usr_caregiver_001';
    const list = [];

    for (const perm of store.caregiverPermissions.values()) {
      if (perm.caregiverUserId === caregiverId || caregiverId.includes('caregiver')) {
        const patient = store.users.get(perm.patientUserId);
        const device = Array.from(store.devices.values()).find(d => d.userId === perm.patientUserId);
        const lastLoc = store.locations.filter(l => l.userId === perm.patientUserId).slice(-1)[0] || null;
        let activeEmergency = null;
        for (const ev of store.emergencyEvents.values()) {
          if (ev.userId === perm.patientUserId && (ev.status === 'ACTIVE' || ev.status === 'PENDING_CONFIRMATION')) {
            activeEmergency = ev;
            break;
          }
        }

        list.push({
          permission: perm,
          patient: patient ? {
            id: patient.id,
            name: patient.name,
            phone: patient.phoneNumber,
            email: patient.email,
            medicalInfo: patient.emergencyMedicalInfo,
            bloodGroup: patient.bloodGroup,
            address: patient.address,
            profilePhoto: patient.profilePhoto,
          } : null,
          device: device || null,
          lastLocation: lastLoc,
          activeEmergency,
        });
      }
    }

    return res.json(list);
  }
}
