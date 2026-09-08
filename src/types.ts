export type UserRole = 'user' | 'caregiver' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  profilePhoto?: string;
  emergencyMedicalInfo?: string;
  bloodGroup?: string;
  address?: string;
  accessibilityVoiceEnabled?: boolean;
  highContrastEnabled?: boolean;
  cancellationTimerSeconds?: number;
  trackingIntervalSeconds?: number;
  createdAt: string;
  updatedAt: string;
}

export type NotificationChannel = 'SMS' | 'EMAIL' | 'PUSH' | 'ALL';
export type ContactPriority = 'PRIMARY' | 'SECONDARY' | 'TERTIARY';

export interface EmergencyContact {
  id: string;
  userId: string;
  contactName: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  notificationPreference: NotificationChannel;
  priority: ContactPriority;
  isAuthorizedCaregiver: boolean;
  createdAt: string;
  updatedAt: string;
}

export type GPSStatus = 'ACTIVE' | 'SEARCHING' | 'LAST_KNOWN' | 'OFFLINE';
export type WiFiStatus = 'CONNECTED' | 'DISCONNECTED' | 'POOR_SIGNAL';
export type ButtonStatus = 'READY' | 'TRIGGERED' | 'DISABLED';

export interface Device {
  id: string;
  userId: string;
  deviceName: string;
  isConnected: boolean;
  batteryLevel: number;
  batteryVoltage: number;
  gpsStatus: GPSStatus;
  wifiStatus: WiFiStatus;
  wifiRssi: number;
  emergencyButtonStatus: ButtonStatus;
  buzzerActive: boolean;
  firmwareVersion: string;
  lastCommunicationAt: string;
  createdAt: string;
}

export interface SensorData {
  id: string;
  deviceId: string;
  frontDistanceCm: number;
  leftDistanceCm: number;
  rightDistanceCm: number;
  frontObstacle: boolean;
  leftObstacle: boolean;
  rightObstacle: boolean;
  recordedAt: string;
}

export interface LocationPoint {
  id: string;
  userId: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  speedKmh: number;
  headingDeg: number;
  gpsStatus: GPSStatus;
  isLiveTracking: boolean;
  address?: string;
  recordedAt: string;
}

export type EmergencyEventStatus = 'PENDING_CONFIRMATION' | 'ACTIVE' | 'RESOLVED' | 'CANCELLED' | 'FAILED';
export type EventTriggerType = 'PHYSICAL_BUTTON' | 'MANUAL_APP' | 'FALL_DETECTION' | 'SIMULATED';

export interface EmergencyEvent {
  id: string;
  userId: string;
  userName?: string;
  deviceId: string;
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  locationAddress: string;
  googleMapsUrl: string;
  eventTrigger: EventTriggerType;
  status: EmergencyEventStatus;
  cancellationReason?: string;
  cancelledAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  countdownRemainingSeconds?: number;
  contactsNotifiedCount?: number;
}

export type NotificationStatus = 'SENDING' | 'SENT' | 'DELIVERED' | 'FAILED';

export interface NotificationRecord {
  id: string;
  emergencyEventId: string;
  userId: string;
  recipientName: string;
  recipientDestination: string;
  channel: 'SMS' | 'EMAIL' | 'PUSH';
  messageContent: string;
  status: NotificationStatus;
  providerReferenceId?: string;
  errorMessage?: string;
  sentAt: string;
  deliveredAt?: string;
}

export interface CaregiverPermission {
  id: string;
  caregiverUserId: string;
  patientUserId: string;
  patientName: string;
  patientPhone: string;
  patientAddress?: string;
  patientBloodGroup?: string;
  canViewLiveLocation: boolean;
  canViewEmergencyAlerts: boolean;
  canTriggerDeviceBuzzer: boolean;
  canViewHealthStatus: boolean;
  status: 'ACTIVE' | 'REVOKED' | 'PENDING';
  createdAt: string;
}

export interface LocationSharingSettings {
  isLiveSharingEnabled: boolean;
  shareWithAllContacts: boolean;
  highAccuracyMode: boolean;
  autoShareOnEmergency: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  device?: Device;
}

export interface SimulationPayload {
  action: 'EMERGENCY' | 'GPS_UPDATE' | 'OBSTACLE' | 'LOW_BATTERY' | 'DISCONNECT' | 'RESET';
  data?: any;
}
