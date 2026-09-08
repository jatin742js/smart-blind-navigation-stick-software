import mongoose from 'mongoose';
import {
  UserModel,
  DeviceModel,
  EmergencyContactModel,
  SensorDataModel,
  LocationPointModel,
  EmergencyEventModel,
  NotificationRecordModel
} from '../models/mongo/schemas';
import { store } from '../models/store';

/**
 * Seeds initial demo data into MongoDB if collections are empty.
 */
export async function seedMongoInitialData(): Promise<void> {
  if (mongoose.connection.readyState !== 1) return;

  try {
    const userCount = await (UserModel as any).countDocuments();
    if (userCount === 0) {
      console.log('[MongoDB] Seeding initial collections in MongoDB...');

      // Seed Users
      const usersToInsert = Array.from(store.users.values()).map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        phoneNumber: u.phoneNumber,
        role: u.role,
        profilePhoto: u.profilePhoto,
        emergencyMedicalInfo: u.emergencyMedicalInfo,
        bloodGroup: u.bloodGroup,
        address: u.address,
        accessibilityVoiceEnabled: u.accessibilityVoiceEnabled,
        highContrastEnabled: u.highContrastEnabled,
        cancellationTimerSeconds: u.cancellationTimerSeconds,
        trackingIntervalSeconds: u.trackingIntervalSeconds,
      }));
      await (UserModel as any).insertMany(usersToInsert);

      // Seed Devices
      const devicesToInsert = Array.from(store.devices.values()).map(d => ({
        id: d.id,
        userId: d.userId,
        deviceName: d.deviceName,
        apiKeyHash: d.apiKeyHash,
        isConnected: d.isConnected,
        batteryLevel: d.batteryLevel,
        batteryVoltage: d.batteryVoltage,
        gpsStatus: d.gpsStatus,
        wifiStatus: d.wifiStatus,
        wifiRssi: d.wifiRssi,
        emergencyButtonStatus: d.emergencyButtonStatus,
        buzzerActive: d.buzzerActive,
        firmwareVersion: d.firmwareVersion,
        lastCommunicationAt: new Date(d.lastCommunicationAt),
      }));
      await (DeviceModel as any).insertMany(devicesToInsert);

      // Seed Emergency Contacts
      const contactsToInsert = Array.from(store.contacts.values()).map(c => ({
        id: c.id,
        userId: c.userId,
        contactName: c.contactName,
        relationship: c.relationship,
        phoneNumber: c.phoneNumber,
        email: c.email,
        notificationPreference: c.notificationPreference,
        priority: c.priority,
        isAuthorizedCaregiver: c.isAuthorizedCaregiver,
      }));
      await (EmergencyContactModel as any).insertMany(contactsToInsert);

      // Seed Locations
      const locationsToInsert = store.locations.map(l => ({
        id: l.id,
        userId: l.userId,
        deviceId: l.deviceId,
        latitude: l.latitude,
        longitude: l.longitude,
        accuracyMeters: l.accuracyMeters,
        speedKmh: l.speedKmh,
        headingDeg: l.headingDeg,
        recordedAt: new Date(l.recordedAt),
      }));
      await (LocationPointModel as any).insertMany(locationsToInsert);

      // Seed Emergency Events
      const eventsToInsert = Array.from(store.emergencyEvents.values()).map(ev => ({
        id: ev.id,
        userId: ev.userId,
        deviceId: ev.deviceId,
        eventTrigger: ev.eventTrigger,
        status: ev.status,
        latitude: ev.latitude,
        longitude: ev.longitude,
        accuracyMeters: ev.accuracyMeters,
        googleMapsUrl: ev.googleMapsUrl,
        locationAddress: ev.locationAddress,
        countdownRemainingSeconds: ev.countdownRemainingSeconds,
        contactsNotifiedCount: ev.contactsNotifiedCount,
      }));
      await (EmergencyEventModel as any).insertMany(eventsToInsert);

      console.log('[MongoDB] Seed completed successfully!');
    }
  } catch (err: any) {
    console.error('[MongoDB] Seeding error:', err.message);
  }
}

/**
 * Persists an emergency event to MongoDB in background
 */
export async function persistEmergencyEventToMongo(event: any): Promise<void> {
  if (mongoose.connection.readyState !== 1) return;
  try {
    await (EmergencyEventModel as any).findOneAndUpdate(
      { id: event.id },
      {
        ...event,
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt),
        cancelledAt: event.cancelledAt ? new Date(event.cancelledAt) : undefined,
        resolvedAt: event.resolvedAt ? new Date(event.resolvedAt) : undefined,
      },
      { upsert: true, new: true }
    );
  } catch (err: any) {
    console.warn('[MongoDB] Failed to persist emergency event:', err.message);
  }
}

/**
 * Persists a GPS location point to MongoDB in background
 */
export async function persistLocationToMongo(point: any): Promise<void> {
  if (mongoose.connection.readyState !== 1) return;
  try {
    await (LocationPointModel as any).create({
      ...point,
      recordedAt: new Date(point.recordedAt),
    });
  } catch (err: any) {
    console.warn('[MongoDB] Failed to persist location point:', err.message);
  }
}

/**
 * Persists a sensor reading to MongoDB in background
 */
export async function persistSensorToMongo(sensor: any): Promise<void> {
  if (mongoose.connection.readyState !== 1) return;
  try {
    await (SensorDataModel as any).create({
      ...sensor,
      recordedAt: new Date(sensor.recordedAt),
    });
  } catch (err: any) {
    console.warn('[MongoDB] Failed to persist sensor data:', err.message);
  }
}

/**
 * Persists an emergency contact to MongoDB in background
 */
export async function persistContactToMongo(contact: any): Promise<void> {
  if (mongoose.connection.readyState !== 1) return;
  try {
    await (EmergencyContactModel as any).findOneAndUpdate(
      { id: contact.id },
      contact,
      { upsert: true, new: true }
    );
  } catch (err: any) {
    console.warn('[MongoDB] Failed to persist contact:', err.message);
  }
}

/**
 * Deletes contact from MongoDB in background
 */
export async function deleteContactFromMongo(id: string): Promise<void> {
  if (mongoose.connection.readyState !== 1) return;
  try {
    await (EmergencyContactModel as any).deleteOne({ id });
  } catch (err: any) {
    console.warn('[MongoDB] Failed to delete contact:', err.message);
  }
}

/**
 * Persists a notification record to MongoDB in background
 */
export async function persistNotificationToMongo(notif: any): Promise<void> {
  if (mongoose.connection.readyState !== 1) return;
  try {
    await (NotificationRecordModel as any).findOneAndUpdate(
      { id: notif.id },
      {
        ...notif,
        sentAt: new Date(notif.sentAt),
        deliveredAt: notif.deliveredAt ? new Date(notif.deliveredAt) : undefined,
      },
      { upsert: true, new: true }
    );
  } catch (err: any) {
    console.warn('[MongoDB] Failed to persist notification:', err.message);
  }
}
