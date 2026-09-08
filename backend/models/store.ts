import {
  User,
  Device,
  EmergencyContact,
  SensorData,
  LocationPoint,
  EmergencyEvent,
  NotificationRecord,
  CaregiverPermission,
  LocationSharingSettings
} from '../../src/types';

// In-Memory Normalized Relational Store
export interface DatabaseState {
  users: Map<string, User & { passwordHash: string }>;
  devices: Map<string, Device & { apiKeyHash: string }>;
  contacts: Map<string, EmergencyContact>;
  sensorData: SensorData[];
  locations: LocationPoint[];
  emergencyEvents: Map<string, EmergencyEvent>;
  notifications: NotificationRecord[];
  caregiverPermissions: Map<string, CaregiverPermission>;
  locationSharing: Map<string, LocationSharingSettings>;
}

const initialUserId = 'usr_001';
const initialCaregiverId = 'usr_caregiver_001';
const initialDeviceId = 'STICK_001';

// Seed Initial State
const usersMap = new Map<string, User & { passwordHash: string }>();
usersMap.set(initialUserId, {
  id: initialUserId,
  name: 'Alex Johnson',
  email: 'alex@smartstick.io',
  phoneNumber: '+1 (555) 234-5678',
  role: 'user',
  profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  emergencyMedicalInfo: 'Visually impaired (total blindness). Diabetic Type 1. Uses smart stick with tactile feedback.',
  bloodGroup: 'O+',
  address: '42 Pine Crest Avenue, Dehradun, UK 248001',
  accessibilityVoiceEnabled: true,
  highContrastEnabled: false,
  cancellationTimerSeconds: 20,
  trackingIntervalSeconds: 5,
  passwordHash: 'password123', // In demo/local env plain check or bcrypt
  createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
});

usersMap.set(initialCaregiverId, {
  id: initialCaregiverId,
  name: 'Sarah Johnson (Caregiver)',
  email: 'sarah.caregiver@smartstick.io',
  phoneNumber: '+1 (555) 987-6543',
  role: 'caregiver',
  profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  emergencyMedicalInfo: 'Authorized primary caregiver & mother of Alex Johnson.',
  bloodGroup: 'A+',
  address: '42 Pine Crest Avenue, Dehradun, UK 248001',
  accessibilityVoiceEnabled: false,
  highContrastEnabled: false,
  cancellationTimerSeconds: 20,
  trackingIntervalSeconds: 5,
  passwordHash: 'caregiver123',
  createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
});

const devicesMap = new Map<string, Device & { apiKeyHash: string }>();
devicesMap.set(initialDeviceId, {
  id: initialDeviceId,
  userId: initialUserId,
  deviceName: 'ESP32 Smart Stick Pro (v1.4)',
  isConnected: true,
  batteryLevel: 84,
  batteryVoltage: 4.12,
  gpsStatus: 'ACTIVE',
  wifiStatus: 'CONNECTED',
  wifiRssi: -58,
  emergencyButtonStatus: 'READY',
  buzzerActive: false,
  firmwareVersion: 'v1.4.2-esp32',
  lastCommunicationAt: new Date().toISOString(),
  createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  apiKeyHash: 'esp32_smartstick_auth_token_secret',
});

const contactsMap = new Map<string, EmergencyContact>();
contactsMap.set('cnt_001', {
  id: 'cnt_001',
  userId: initialUserId,
  contactName: 'Sarah Johnson',
  relationship: 'Mother / Primary Caregiver',
  phoneNumber: '+1 (555) 987-6543',
  email: 'sarah.caregiver@smartstick.io',
  notificationPreference: 'ALL',
  priority: 'PRIMARY',
  isAuthorizedCaregiver: true,
  createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
});

contactsMap.set('cnt_002', {
  id: 'cnt_002',
  userId: initialUserId,
  contactName: 'David Miller',
  relationship: 'Brother',
  phoneNumber: '+1 (555) 345-6789',
  email: 'david.m@example.com',
  notificationPreference: 'SMS',
  priority: 'SECONDARY',
  isAuthorizedCaregiver: false,
  createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
});

contactsMap.set('cnt_003', {
  id: 'cnt_003',
  userId: initialUserId,
  contactName: 'Dr. Emily Chen',
  relationship: 'Physician / Specialist',
  phoneNumber: '+1 (555) 890-1234',
  email: 'dr.emilychen@clinic.org',
  notificationPreference: 'EMAIL',
  priority: 'TERTIARY',
  isAuthorizedCaregiver: false,
  createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
});

const initialLocations: LocationPoint[] = [
  {
    id: 'loc_001',
    userId: initialUserId,
    deviceId: initialDeviceId,
    latitude: 30.3165,
    longitude: 78.0322,
    accuracyMeters: 4.8,
    speedKmh: 2.1,
    headingDeg: 45,
    gpsStatus: 'ACTIVE',
    isLiveTracking: true,
    address: 'Rajpur Road, Near Central Clock Tower, Dehradun',
    recordedAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'loc_002',
    userId: initialUserId,
    deviceId: initialDeviceId,
    latitude: 30.3172,
    longitude: 78.0331,
    accuracyMeters: 4.2,
    speedKmh: 2.4,
    headingDeg: 55,
    gpsStatus: 'ACTIVE',
    isLiveTracking: true,
    address: 'Gandhi Park Pedestrian Crossing, Dehradun',
    recordedAt: new Date(Date.now() - 30000).toISOString(),
  },
  {
    id: 'loc_003',
    userId: initialUserId,
    deviceId: initialDeviceId,
    latitude: 30.3180,
    longitude: 78.0340,
    accuracyMeters: 3.5,
    speedKmh: 1.8,
    headingDeg: 60,
    gpsStatus: 'ACTIVE',
    isLiveTracking: true,
    address: 'Paltan Bazaar Plaza Entrance, Dehradun',
    recordedAt: new Date().toISOString(),
  }
];

const initialSensorData: SensorData[] = [
  {
    id: 'sen_001',
    deviceId: initialDeviceId,
    frontDistanceCm: 85,
    leftDistanceCm: 120,
    rightDistanceCm: 35,
    frontObstacle: false,
    leftObstacle: false,
    rightObstacle: true,
    recordedAt: new Date().toISOString(),
  }
];

const caregiverPermissionsMap = new Map<string, CaregiverPermission>();
caregiverPermissionsMap.set('perm_001', {
  id: 'perm_001',
  caregiverUserId: initialCaregiverId,
  patientUserId: initialUserId,
  patientName: 'Alex Johnson',
  patientPhone: '+1 (555) 234-5678',
  patientAddress: '42 Pine Crest Avenue, Dehradun, UK 248001',
  patientBloodGroup: 'O+',
  canViewLiveLocation: true,
  canViewEmergencyAlerts: true,
  canTriggerDeviceBuzzer: true,
  canViewHealthStatus: true,
  status: 'ACTIVE',
  createdAt: new Date().toISOString(),
});

const locationSharingMap = new Map<string, LocationSharingSettings>();
locationSharingMap.set(initialUserId, {
  isLiveSharingEnabled: true,
  shareWithAllContacts: true,
  highAccuracyMode: true,
  autoShareOnEmergency: true,
});

const emergencyEventsMap = new Map<string, EmergencyEvent>();
// Seed a past resolved emergency event for history
emergencyEventsMap.set('evt_prev_001', {
  id: 'evt_prev_001',
  userId: initialUserId,
  userName: 'Alex Johnson',
  deviceId: initialDeviceId,
  latitude: 30.3160,
  longitude: 78.0315,
  accuracyMeters: 5.0,
  locationAddress: 'Clock Tower Intersection, Dehradun',
  googleMapsUrl: 'https://www.google.com/maps?q=30.3160,78.0315',
  eventTrigger: 'PHYSICAL_BUTTON',
  status: 'RESOLVED',
  contactsNotifiedCount: 3,
  resolvedAt: new Date(Date.now() - 86400000).toISOString(),
  createdAt: new Date(Date.now() - 86400000 - 1800000).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
});

export const store: DatabaseState = {
  users: usersMap,
  devices: devicesMap,
  contacts: contactsMap,
  sensorData: initialSensorData,
  locations: initialLocations,
  emergencyEvents: emergencyEventsMap,
  notifications: [
    {
      id: 'notif_prev_001',
      emergencyEventId: 'evt_prev_001',
      userId: initialUserId,
      recipientName: 'Sarah Johnson',
      recipientDestination: '+1 (555) 987-6543',
      channel: 'SMS',
      messageContent: '🚨 EMERGENCY ALERT: Alex Johnson may need immediate assistance. Current Location: https://www.google.com/maps?q=30.3160,78.0315',
      status: 'DELIVERED',
      providerReferenceId: 'TWILIO_SM_9921',
      sentAt: new Date(Date.now() - 86400000 - 1790000).toISOString(),
      deliveredAt: new Date(Date.now() - 86400000 - 1785000).toISOString(),
    },
    {
      id: 'notif_prev_002',
      emergencyEventId: 'evt_prev_001',
      userId: initialUserId,
      recipientName: 'Sarah Johnson',
      recipientDestination: 'sarah.caregiver@smartstick.io',
      channel: 'EMAIL',
      messageContent: '🚨 EMERGENCY ALERT: Alex Johnson may need immediate assistance.',
      status: 'DELIVERED',
      providerReferenceId: 'SMTP_MSG_3310',
      sentAt: new Date(Date.now() - 86400000 - 1790000).toISOString(),
      deliveredAt: new Date(Date.now() - 86400000 - 1780000).toISOString(),
    }
  ],
  caregiverPermissions: caregiverPermissionsMap,
  locationSharing: locationSharingMap,
};

// SSE Subscribers list for real-time live events
export type SSEClient = {
  id: string;
  res: any;
};

export const sseClients: SSEClient[] = [];

export function broadcastSSE(eventType: string, payload: any) {
  const data = JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() });
  for (let i = sseClients.length - 1; i >= 0; i--) {
    const client = sseClients[i];
    try {
      client.res.write(`event: ${eventType}\ndata: ${data}\n\n`);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}
