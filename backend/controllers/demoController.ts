import { Request, Response } from 'express';
import { store, broadcastSSE } from '../models/store';
import { NotificationService } from '../services/notificationService';
import { LocationPoint, SensorData, EmergencyEvent, EmergencyContact } from '../../src/types';

export class DemoController {
  /**
   * 1. Simulate Emergency Button press from smart stick
   */
  static async simulateEmergency(req: Request, res: Response) {
    const device = store.devices.get('STICK_001')!;
    const user = store.users.get('usr_001')!;

    // Jitter coordinates slightly
    const lat = 30.3180 + (Math.random() - 0.5) * 0.005;
    const lng = 78.0340 + (Math.random() - 0.5) * 0.005;

    device.emergencyButtonStatus = 'TRIGGERED';
    device.buzzerActive = true;
    device.lastCommunicationAt = new Date().toISOString();
    store.devices.set(device.id, device);

    const userContacts: EmergencyContact[] = [];
    for (const c of store.contacts.values()) {
      if (c.userId === user.id) {
        userContacts.push(c);
      }
    }

    const eventId = `evt_sim_${Date.now()}`;
    const cancelTimeout = user.cancellationTimerSeconds || 20;

    const newEvent: EmergencyEvent = {
      id: eventId,
      userId: user.id,
      userName: `${user.name} (Simulated)`,
      deviceId: device.id,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      accuracyMeters: 3.8,
      locationAddress: 'Gandhi Road Promenade, Near City Center (Simulated)',
      googleMapsUrl: `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`,
      eventTrigger: 'SIMULATED',
      status: 'PENDING_CONFIRMATION',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      countdownRemainingSeconds: cancelTimeout,
      contactsNotifiedCount: userContacts.length,
    };

    store.emergencyEvents.set(eventId, newEvent);

    // Schedule cancellation countdown
    NotificationService.scheduleEmergencyCountdown(newEvent, user, userContacts, cancelTimeout);
    broadcastSSE('EMERGENCY_PENDING', newEvent);

    return res.status(201).json({
      success: true,
      message: 'Simulated Emergency Button event dispatched! Countdown timer started.',
      event: newEvent,
    });
  }

  /**
   * 2. Simulate GPS Update (movement path)
   */
  static async simulateGPSUpdate(req: Request, res: Response) {
    const device = store.devices.get('STICK_001')!;
    const lastLoc = store.locations.length > 0 ? store.locations[store.locations.length - 1] : { latitude: 30.3165, longitude: 78.0322 };

    // Move slightly northward/eastward
    const nextLat = lastLoc.latitude + 0.0006 + (Math.random() * 0.0003);
    const nextLng = lastLoc.longitude + 0.0005 + (Math.random() * 0.0003);

    const locPoint: LocationPoint = {
      id: `loc_sim_${Date.now()}`,
      userId: 'usr_001',
      deviceId: 'STICK_001',
      latitude: Number(nextLat.toFixed(6)),
      longitude: Number(nextLng.toFixed(6)),
      accuracyMeters: 3.2,
      speedKmh: 3.6,
      headingDeg: Math.floor(Math.random() * 360),
      gpsStatus: 'ACTIVE',
      isLiveTracking: true,
      address: `Simulated Walking Route point @ ${new Date().toLocaleTimeString()}`,
      recordedAt: new Date().toISOString(),
    };

    store.locations.push(locPoint);
    if (store.locations.length > 100) store.locations.shift();

    device.lastCommunicationAt = new Date().toISOString();
    device.gpsStatus = 'ACTIVE';
    store.devices.set(device.id, device);

    broadcastSSE('LOCATION_UPDATED', locPoint);
    return res.json({ success: true, location: locPoint });
  }

  /**
   * 3. Simulate Obstacle detected by ultrasonic sensors
   */
  static async simulateObstacle(req: Request, res: Response) {
    const device = store.devices.get('STICK_001')!;

    // Set a close obstacle (< 40cm) on front or right
    const sensorReading: SensorData = {
      id: `sen_sim_${Date.now()}`,
      deviceId: 'STICK_001',
      frontDistanceCm: 28.5, // DANGER
      leftDistanceCm: 95.0,
      rightDistanceCm: 32.0, // CAUTION
      frontObstacle: true,
      leftObstacle: false,
      rightObstacle: true,
      recordedAt: new Date().toISOString(),
    };

    store.sensorData.push(sensorReading);
    if (store.sensorData.length > 50) store.sensorData.shift();

    device.buzzerActive = true;
    device.lastCommunicationAt = new Date().toISOString();
    store.devices.set(device.id, device);

    broadcastSSE('SENSOR_UPDATED', { sensor: sensorReading, device });
    broadcastSSE('OBSTACLE_ALERT', { sensor: sensorReading });

    return res.json({
      success: true,
      message: 'Simulated obstacle detected 28.5cm ahead! Smart stick buzzer triggered.',
      sensor: sensorReading,
    });
  }

  /**
   * 4. Simulate Low Battery
   */
  static async simulateLowBattery(req: Request, res: Response) {
    const device = store.devices.get('STICK_001')!;
    device.batteryLevel = 14;
    device.batteryVoltage = 3.42;
    device.lastCommunicationAt = new Date().toISOString();
    store.devices.set(device.id, device);

    broadcastSSE('DEVICE_UPDATED', device);
    return res.json({
      success: true,
      message: 'Battery level updated to 14% (Low Battery Warning triggered).',
      device,
    });
  }

  /**
   * 5. Simulate Device Disconnect / Reconnect
   */
  static async simulateDisconnect(req: Request, res: Response) {
    const device = store.devices.get('STICK_001')!;
    device.isConnected = !device.isConnected;
    device.wifiStatus = device.isConnected ? 'CONNECTED' : 'DISCONNECTED';
    device.lastCommunicationAt = new Date().toISOString();
    store.devices.set(device.id, device);

    broadcastSSE('DEVICE_UPDATED', device);
    return res.json({
      success: true,
      message: `Device status switched to: ${device.isConnected ? 'Connected 🟢' : 'Disconnected 🔴'}`,
      device,
    });
  }

  /**
   * Reset simulation state
   */
  static async resetSimulation(req: Request, res: Response) {
    const device = store.devices.get('STICK_001')!;
    device.isConnected = true;
    device.batteryLevel = 85;
    device.batteryVoltage = 4.12;
    device.gpsStatus = 'ACTIVE';
    device.wifiStatus = 'CONNECTED';
    device.emergencyButtonStatus = 'READY';
    device.buzzerActive = false;
    device.lastCommunicationAt = new Date().toISOString();
    store.devices.set(device.id, device);

    // Clear active emergency events
    for (const [id, ev] of store.emergencyEvents.entries()) {
      if (ev.status === 'PENDING_CONFIRMATION' || ev.status === 'ACTIVE') {
        ev.status = 'RESOLVED';
        ev.resolvedAt = new Date().toISOString();
        store.emergencyEvents.set(id, ev);
      }
    }

    const resetSensor: SensorData = {
      id: `sen_reset_${Date.now()}`,
      deviceId: 'STICK_001',
      frontDistanceCm: 110,
      leftDistanceCm: 140,
      rightDistanceCm: 90,
      frontObstacle: false,
      leftObstacle: false,
      rightObstacle: false,
      recordedAt: new Date().toISOString(),
    };
    store.sensorData.push(resetSensor);

    broadcastSSE('DEVICE_UPDATED', device);
    broadcastSSE('SENSOR_UPDATED', { sensor: resetSensor, device });
    broadcastSSE('EMERGENCY_RESOLVED', { id: 'all' });

    return res.json({ success: true, message: 'Simulation reset to nominal safe operating state.' });
  }
}
