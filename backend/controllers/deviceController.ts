import { Request, Response } from 'express';
import { store, broadcastSSE } from '../models/store';
import { NotificationService } from '../services/notificationService';
import {
  Device,
  SensorData,
  LocationPoint,
  EmergencyEvent,
  EmergencyContact
} from '../../src/types';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  persistLocationToMongo,
  persistSensorToMongo,
  persistEmergencyEventToMongo
} from '../services/mongoSync';

export class DeviceController {
  /**
   * ESP32 or User registers a Smart Stick device
   */
  static async registerDevice(req: Request, res: Response) {
    const { deviceId, deviceName, userId, apiKey } = req.body;
    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    const assignedUserId = userId || 'usr_001';
    const newDevice: Device & { apiKeyHash: string } = {
      id: deviceId,
      userId: assignedUserId,
      deviceName: deviceName || `ESP32 Smart Stick (${deviceId})`,
      isConnected: true,
      batteryLevel: 100,
      batteryVoltage: 4.2,
      gpsStatus: 'ACTIVE',
      wifiStatus: 'CONNECTED',
      wifiRssi: -50,
      emergencyButtonStatus: 'READY',
      buzzerActive: false,
      firmwareVersion: 'v1.4.2-esp32',
      lastCommunicationAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      apiKeyHash: apiKey || 'esp32_smartstick_auth_token_secret',
    };

    store.devices.set(deviceId, newDevice);
    broadcastSSE('DEVICE_REGISTERED', newDevice);
    return res.status(201).json(newDevice);
  }

  /**
   * Retrieves overall hardware status for user's smart stick
   */
  static async getDeviceStatus(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'usr_001';

    // Find device assigned to this user
    let device: Device | undefined;
    for (const d of store.devices.values()) {
      if (d.userId === userId) {
        device = d;
        break;
      }
    }

    if (!device) {
      // Return default device
      device = store.devices.get('STICK_001');
    }

    if (!device) {
      return res.status(404).json({ error: 'No smart stick device linked to this account.' });
    }

    // Get latest sensor data
    const latestSensor = store.sensorData.length > 0
      ? store.sensorData[store.sensorData.length - 1]
      : {
          frontDistanceCm: 85,
          leftDistanceCm: 120,
          rightDistanceCm: 35,
          frontObstacle: false,
          leftObstacle: false,
          rightObstacle: true,
        };

    // Check last active emergency
    let activeEmergency: EmergencyEvent | null = null;
    for (const ev of store.emergencyEvents.values()) {
      if (ev.userId === userId && (ev.status === 'ACTIVE' || ev.status === 'PENDING_CONFIRMATION')) {
        activeEmergency = ev;
        break;
      }
    }

    // Get latest location
    const latestLocation = store.locations.length > 0
      ? store.locations[store.locations.length - 1]
      : null;

    return res.json({
      device,
      sensor: latestSensor,
      location: latestLocation,
      activeEmergency,
    });
  }

  /**
   * ESP32 transmits periodic or updated GPS telemetry
   */
  static async recordLocation(req: Request, res: Response) {
    const { deviceId, latitude, longitude, accuracy, speed, heading, isLiveTracking } = req.body;
    if (!deviceId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'deviceId, latitude, and longitude are required' });
    }

    const device = store.devices.get(deviceId) || store.devices.get('STICK_001');
    const userId = device ? device.userId : 'usr_001';

    if (device) {
      device.isConnected = true;
      device.gpsStatus = 'ACTIVE';
      device.lastCommunicationAt = new Date().toISOString();
      store.devices.set(device.id, device);
    }

    const locationPoint: LocationPoint = {
      id: `loc_${Date.now()}`,
      userId,
      deviceId,
      latitude: Number(latitude),
      longitude: Number(longitude),
      accuracyMeters: accuracy !== undefined ? Number(accuracy) : 4.5,
      speedKmh: speed !== undefined ? Number(speed) : 0,
      headingDeg: heading !== undefined ? Number(heading) : 0,
      gpsStatus: 'ACTIVE',
      isLiveTracking: isLiveTracking !== false,
      address: `Latitude: ${Number(latitude).toFixed(4)}, Longitude: ${Number(longitude).toFixed(4)}`,
      recordedAt: new Date().toISOString(),
    };

    store.locations.push(locationPoint);
    // Keep max 100 recent points
    if (store.locations.length > 100) {
      store.locations.shift();
    }

    broadcastSSE('LOCATION_UPDATED', locationPoint);
    persistLocationToMongo(locationPoint);
    return res.status(201).json(locationPoint);
  }

  /**
   * ESP32 transmits ultrasonic distance readings
   */
  static async recordSensorData(req: Request, res: Response) {
    const { deviceId, frontDistanceCm, leftDistanceCm, rightDistanceCm, latitude, longitude, accuracy, battery, wifiRssi } = req.body;
    const targetDevId = deviceId || 'STICK_001';
    const device = store.devices.get(targetDevId);

    if (device) {
      device.isConnected = true;
      device.lastCommunicationAt = new Date().toISOString();
      if (battery !== undefined) device.batteryLevel = Math.min(100, Math.max(0, Number(battery)));
      if (wifiRssi !== undefined) device.wifiRssi = Number(wifiRssi);
      store.devices.set(device.id, device);
    }

    const front = Number(frontDistanceCm);
    const left = Number(leftDistanceCm);
    const right = Number(rightDistanceCm);

    const sensorReading: SensorData = {
      id: `sen_${Date.now()}`,
      deviceId: targetDevId,
      frontDistanceCm: front,
      leftDistanceCm: left,
      rightDistanceCm: right,
      frontObstacle: front < 50.0,
      leftObstacle: left < 45.0,
      rightObstacle: right < 45.0,
      recordedAt: new Date().toISOString(),
    };

    store.sensorData.push(sensorReading);
    if (store.sensorData.length > 50) {
      store.sensorData.shift();
    }
    persistSensorToMongo(sensorReading);

    // If coordinates also sent in this packet, update location
    if (latitude !== undefined && longitude !== undefined && device) {
      const locPoint: LocationPoint = {
        id: `loc_${Date.now()}`,
        userId: device.userId,
        deviceId: targetDevId,
        latitude: Number(latitude),
        longitude: Number(longitude),
        accuracyMeters: accuracy !== undefined ? Number(accuracy) : 4.2,
        speedKmh: 1.5,
        headingDeg: 0,
        gpsStatus: 'ACTIVE',
        isLiveTracking: true,
        address: `Telemetry reading at ${new Date().toLocaleTimeString()}`,
        recordedAt: new Date().toISOString(),
      };
      store.locations.push(locPoint);
      broadcastSSE('LOCATION_UPDATED', locPoint);
      persistLocationToMongo(locPoint);
    }

    broadcastSSE('SENSOR_UPDATED', { sensor: sensorReading, device });
    return res.status(201).json(sensorReading);
  }

  /**
   * ESP32 Physical Emergency Push Button OR Dashboard Trigger
   */
  static async triggerEmergency(req: Request, res: Response) {
    const { deviceId, latitude, longitude, accuracy, battery, triggerType, bypassCountdown } = req.body;
    const targetDevId = deviceId || 'STICK_001';
    const device = store.devices.get(targetDevId) || store.devices.get('STICK_001');

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const userId = device.userId || 'usr_001';
    const user = store.users.get(userId);
    if (!user) {
      return res.status(404).json({ error: 'Associated user not found' });
    }

    // Mark device state
    device.emergencyButtonStatus = 'TRIGGERED';
    device.buzzerActive = true;
    device.lastCommunicationAt = new Date().toISOString();
    if (battery !== undefined) device.batteryLevel = Number(battery);
    store.devices.set(device.id, device);

    // Resolve location: use sent coords or latest stored
    let lat = latitude !== undefined ? Number(latitude) : null;
    let lng = longitude !== undefined ? Number(longitude) : null;
    let acc = accuracy !== undefined ? Number(accuracy) : null;
    let locAddress = 'Current live GPS coordinates';

    if (lat === null || lng === null) {
      const lastLoc = store.locations.length > 0 ? store.locations[store.locations.length - 1] : null;
      if (lastLoc) {
        lat = lastLoc.latitude;
        lng = lastLoc.longitude;
        acc = lastLoc.accuracyMeters;
        locAddress = lastLoc.address || 'Last known GPS location';
      }
    }

    const mapsUrl = (lat !== null && lng !== null)
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : 'https://www.google.com/maps';

    // Find user's emergency contacts
    const userContacts: EmergencyContact[] = [];
    for (const c of store.contacts.values()) {
      if (c.userId === userId) {
        userContacts.push(c);
      }
    }

    const cancelTimeout = user.cancellationTimerSeconds || 20;
    const isImmediate = bypassCountdown === true;

    const eventId = `evt_${Date.now()}`;
    const emergencyEvent: EmergencyEvent = {
      id: eventId,
      userId,
      userName: user.name,
      deviceId: device.id,
      latitude: lat,
      longitude: lng,
      accuracyMeters: acc,
      locationAddress: locAddress,
      googleMapsUrl: mapsUrl,
      eventTrigger: triggerType || 'PHYSICAL_BUTTON',
      status: isImmediate ? 'ACTIVE' : 'PENDING_CONFIRMATION',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      countdownRemainingSeconds: isImmediate ? 0 : cancelTimeout,
      contactsNotifiedCount: userContacts.length,
    };

    store.emergencyEvents.set(eventId, emergencyEvent);
    persistEmergencyEventToMongo(emergencyEvent);

    if (isImmediate) {
      // Dispatch notifications right away
      await NotificationService.dispatchEmergencyNotifications(emergencyEvent, user, userContacts);
      broadcastSSE('EMERGENCY_ACTIVATED', emergencyEvent);
    } else {
      // Start cancel window countdown
      NotificationService.scheduleEmergencyCountdown(emergencyEvent, user, userContacts, cancelTimeout);
      broadcastSSE('EMERGENCY_PENDING', emergencyEvent);
    }

    return res.status(201).json(emergencyEvent);
  }

  /**
   * User cancels emergency within countdown window
   */
  static async cancelEmergency(req: Request, res: Response) {
    const { eventId, reason } = req.body;
    let targetEventId = eventId;

    if (!targetEventId) {
      // Find latest pending or active emergency
      for (const ev of store.emergencyEvents.values()) {
        if (ev.status === 'PENDING_CONFIRMATION' || ev.status === 'ACTIVE') {
          targetEventId = ev.id;
          break;
        }
      }
    }

    if (!targetEventId) {
      return res.status(404).json({ error: 'No active or pending emergency event found to cancel.' });
    }

    const cancelledEvent = NotificationService.cancelEmergency(targetEventId, reason || 'False Alarm / Cancelled by User');
    if (!cancelledEvent) {
      return res.status(404).json({ error: 'Emergency event not found' });
    }

    persistEmergencyEventToMongo(cancelledEvent);
    return res.json({ success: true, event: cancelledEvent });
  }

  /**
   * Resolves an emergency
   */
  static async resolveEmergency(req: Request, res: Response) {
    const { eventId } = req.body;
    let targetId = eventId;
    if (!targetId) {
      for (const ev of store.emergencyEvents.values()) {
        if (ev.status === 'ACTIVE') {
          targetId = ev.id;
          break;
        }
      }
    }

    const event = targetId ? store.emergencyEvents.get(targetId) : null;
    if (!event) {
      return res.status(404).json({ error: 'Active emergency event not found.' });
    }

    event.status = 'RESOLVED';
    event.resolvedAt = new Date().toISOString();
    event.updatedAt = new Date().toISOString();
    store.emergencyEvents.set(event.id, event);
    persistEmergencyEventToMongo(event);

    const device = store.devices.get(event.deviceId);
    if (device) {
      device.emergencyButtonStatus = 'READY';
      device.buzzerActive = false;
      store.devices.set(device.id, device);
    }

    broadcastSSE('EMERGENCY_RESOLVED', event);
    return res.json(event);
  }

  /**
   * Sends buzzer beep command to smart stick
   */
  static async triggerBuzzerCommand(req: Request, res: Response) {
    const { deviceId, durationMs, frequencyHz } = req.body;
    const targetDevId = deviceId || 'STICK_001';
    const device = store.devices.get(targetDevId);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    device.buzzerActive = true;
    store.devices.set(device.id, device);

    broadcastSSE('BUZZER_TRIGGERED', {
      deviceId: targetDevId,
      durationMs: durationMs || 2000,
      frequencyHz: frequencyHz || 2000,
      message: 'Stick buzzer and voice alert ringing',
    });

    setTimeout(() => {
      if (device) {
        device.buzzerActive = false;
        store.devices.set(device.id, device);
        broadcastSSE('BUZZER_SILENCED', { deviceId: targetDevId });
      }
    }, durationMs || 2000);

    return res.json({ success: true, message: 'Buzzer trigger sent to ESP32 smart stick.' });
  }

  /**
   * Heartbeat ping from ESP32
   */
  static async heartbeat(req: Request, res: Response) {
    const { deviceId, battery, wifiRssi } = req.body;
    const targetDevId = deviceId || 'STICK_001';
    const device = store.devices.get(targetDevId);

    if (device) {
      device.isConnected = true;
      device.lastCommunicationAt = new Date().toISOString();
      if (battery !== undefined) device.batteryLevel = Number(battery);
      if (wifiRssi !== undefined) device.wifiRssi = Number(wifiRssi);
      store.devices.set(device.id, device);
      broadcastSSE('DEVICE_HEARTBEAT', device);
    }

    return res.json({ status: 'ok', time: new Date().toISOString() });
  }
}
