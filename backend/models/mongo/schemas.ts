import mongoose, { Schema } from 'mongoose';
import {
  UserRole,
  ContactPriority,
  NotificationChannel,
  NotificationStatus,
  EmergencyEventStatus,
  EventTriggerType,
  GPSStatus,
  WiFiStatus,
  ButtonStatus
} from '../../../src/types';

/* =========================================================================
   1. User Schema
   ========================================================================= */
export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phoneNumber: string;
  role: UserRole;
  profilePhoto?: string;
  emergencyMedicalInfo?: string;
  bloodGroup?: string;
  address?: string;
  accessibilityVoiceEnabled: boolean;
  highContrastEnabled: boolean;
  cancellationTimerSeconds: number;
  trackingIntervalSeconds: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    phoneNumber: { type: String, required: true, trim: true },
    role: { type: String, enum: ['user', 'caregiver', 'admin'], default: 'user' },
    profilePhoto: { type: String },
    emergencyMedicalInfo: { type: String },
    bloodGroup: { type: String },
    address: { type: String },
    accessibilityVoiceEnabled: { type: Boolean, default: true },
    highContrastEnabled: { type: Boolean, default: false },
    cancellationTimerSeconds: { type: Number, default: 20 },
    trackingIntervalSeconds: { type: Number, default: 5 },
  },
  { timestamps: true }
);

/* =========================================================================
   2. Device Schema
   ========================================================================= */
export interface IDevice {
  id: string;
  userId: string;
  deviceName: string;
  apiKeyHash: string;
  isConnected: boolean;
  batteryLevel: number;
  batteryVoltage: number;
  gpsStatus: GPSStatus;
  wifiStatus: WiFiStatus;
  wifiRssi?: number;
  emergencyButtonStatus: ButtonStatus;
  buzzerActive: boolean;
  firmwareVersion: string;
  lastCommunicationAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export const DeviceSchema = new Schema<IDevice>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    deviceName: { type: String, required: true, default: 'ESP32 Smart Stick' },
    apiKeyHash: { type: String, required: true },
    isConnected: { type: Boolean, default: true },
    batteryLevel: { type: Number, default: 84, min: 0, max: 100 },
    batteryVoltage: { type: Number, default: 4.12 },
    gpsStatus: { type: String, enum: ['ACTIVE', 'SEARCHING', 'OFFLINE'], default: 'ACTIVE' },
    wifiStatus: { type: String, enum: ['CONNECTED', 'DISCONNECTED', 'CONNECTING'], default: 'CONNECTED' },
    wifiRssi: { type: Number, default: -58 },
    emergencyButtonStatus: { type: String, enum: ['READY', 'TRIGGERED', 'FAULT'], default: 'READY' },
    buzzerActive: { type: Boolean, default: false },
    firmwareVersion: { type: String, default: 'v1.4.2-esp32' },
    lastCommunicationAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

/* =========================================================================
   3. Emergency Contact Schema
   ========================================================================= */
export interface IEmergencyContact {
  id: string;
  userId: string;
  contactName: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  notificationPreference: NotificationChannel;
  priority: ContactPriority;
  isAuthorizedCaregiver: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    contactName: { type: String, required: true, trim: true },
    relationship: { type: String, required: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    notificationPreference: { type: String, enum: ['SMS', 'EMAIL', 'PUSH', 'ALL'], default: 'ALL' },
    priority: { type: String, enum: ['PRIMARY', 'SECONDARY', 'TERTIARY'], default: 'PRIMARY' },
    isAuthorizedCaregiver: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* =========================================================================
   4. Sensor Data Schema
   ========================================================================= */
export interface ISensorData {
  id: string;
  deviceId: string;
  frontDistanceCm: number;
  leftDistanceCm: number;
  rightDistanceCm: number;
  frontObstacle: boolean;
  leftObstacle: boolean;
  rightObstacle: boolean;
  recordedAt?: Date | string;
}

export const SensorDataSchema = new Schema<ISensorData>(
  {
    id: { type: String, required: true, unique: true, index: true },
    deviceId: { type: String, required: true, index: true },
    frontDistanceCm: { type: Number, required: true },
    leftDistanceCm: { type: Number, required: true },
    rightDistanceCm: { type: Number, required: true },
    frontObstacle: { type: Boolean, default: false },
    leftObstacle: { type: Boolean, default: false },
    rightObstacle: { type: Boolean, default: false },
    recordedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

/* =========================================================================
   5. Location Point Schema
   ========================================================================= */
export interface ILocationPoint {
  id: string;
  userId: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  speedKmh: number;
  headingDeg?: number;
  altitudeMeters?: number;
  recordedAt?: Date | string;
}

export const LocationPointSchema = new Schema<ILocationPoint>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    deviceId: { type: String, required: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracyMeters: { type: Number, default: 5 },
    speedKmh: { type: Number, default: 0 },
    headingDeg: { type: Number },
    altitudeMeters: { type: Number },
    recordedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

/* =========================================================================
   6. Emergency Event Schema
   ========================================================================= */
export interface IEmergencyEvent {
  id: string;
  userId: string;
  deviceId: string;
  eventTrigger: EventTriggerType;
  status: EmergencyEventStatus;
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  googleMapsUrl?: string;
  locationAddress?: string;
  countdownRemainingSeconds?: number;
  cancellationReason?: string;
  cancelledAt?: Date | string;
  resolvedAt?: Date | string;
  contactsNotifiedCount: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export const EmergencyEventSchema = new Schema<IEmergencyEvent>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    deviceId: { type: String, required: true, index: true },
    eventTrigger: { type: String, enum: ['PHYSICAL_BUTTON', 'MANUAL_APP', 'OBSTACLE_COLLISION', 'FALL_DETECTION', 'SIMULATED'], default: 'PHYSICAL_BUTTON' },
    status: { type: String, enum: ['PENDING_CONFIRMATION', 'ACTIVE', 'RESOLVED', 'CANCELLED', 'FAILED'], default: 'PENDING_CONFIRMATION', index: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    accuracyMeters: { type: Number, default: null },
    googleMapsUrl: { type: String },
    locationAddress: { type: String },
    countdownRemainingSeconds: { type: Number, default: 20 },
    cancellationReason: { type: String },
    cancelledAt: { type: Date },
    resolvedAt: { type: Date },
    contactsNotifiedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* =========================================================================
   7. Notification Record Schema
   ========================================================================= */
export interface INotificationRecord {
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
  sentAt?: Date | string;
  deliveredAt?: Date | string;
}

export const NotificationRecordSchema = new Schema<INotificationRecord>(
  {
    id: { type: String, required: true, unique: true, index: true },
    emergencyEventId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    recipientName: { type: String, required: true },
    recipientDestination: { type: String, required: true },
    channel: { type: String, enum: ['SMS', 'EMAIL', 'PUSH'], required: true },
    messageContent: { type: String, required: true },
    status: { type: String, enum: ['SENDING', 'SENT', 'DELIVERED', 'FAILED'], default: 'SENDING' },
    providerReferenceId: { type: String },
    errorMessage: { type: String },
    sentAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

/* =========================================================================
   8. Export Models
   ========================================================================= */
export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const DeviceModel = mongoose.models.Device || mongoose.model<IDevice>('Device', DeviceSchema);
export const EmergencyContactModel = mongoose.models.EmergencyContact || mongoose.model<IEmergencyContact>('EmergencyContact', EmergencyContactSchema);
export const SensorDataModel = mongoose.models.SensorData || mongoose.model<ISensorData>('SensorData', SensorDataSchema);
export const LocationPointModel = mongoose.models.LocationPoint || mongoose.model<ILocationPoint>('LocationPoint', LocationPointSchema);
export const EmergencyEventModel = mongoose.models.EmergencyEvent || mongoose.model<IEmergencyEvent>('EmergencyEvent', EmergencyEventSchema);
export const NotificationRecordModel = mongoose.models.NotificationRecord || mongoose.model<INotificationRecord>('NotificationRecord', NotificationRecordSchema);
