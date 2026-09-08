/**
 * MongoDB Initialization & Schema Setup Script for Smart Blind Navigation Stick
 * Usage:
 *   mongosh smartstick_db < database/init-mongo.js
 *   or in docker-compose.yml:
 *     volumes:
 *       - ./database/init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro
 */

db = db.getSiblingDB('smartstick_db');

print('>>> Initializing Smart Blind Navigation Stick MongoDB Collections & Indexes...');

// 1. Users
db.createCollection('users');
db.users.createIndex({ id: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phoneNumber: 1 });

// 2. Devices
db.createCollection('devices');
db.devices.createIndex({ id: 1 }, { unique: true });
db.devices.createIndex({ userId: 1 });
db.devices.createIndex({ apiKeyHash: 1 });

// 3. Emergency Contacts
db.createCollection('emergencycontacts');
db.emergencycontacts.createIndex({ id: 1 }, { unique: true });
db.emergencycontacts.createIndex({ userId: 1 });
db.emergencycontacts.createIndex({ priority: 1 });

// 4. Ultrasonic Sensor Telemetry
db.createCollection('sensordatas');
db.sensordatas.createIndex({ id: 1 }, { unique: true });
db.sensordatas.createIndex({ deviceId: 1 });
db.sensordatas.createIndex({ recordedAt: -1 });

// 5. GPS Location Breadcrumb Trail
db.createCollection('locationpoints');
db.locationpoints.createIndex({ id: 1 }, { unique: true });
db.locationpoints.createIndex({ userId: 1 });
db.locationpoints.createIndex({ deviceId: 1 });
db.locationpoints.createIndex({ recordedAt: -1 });

// 6. Emergency Incidents & Audit Log
db.createCollection('emergencyevents');
db.emergencyevents.createIndex({ id: 1 }, { unique: true });
db.emergencyevents.createIndex({ userId: 1 });
db.emergencyevents.createIndex({ status: 1 });
db.emergencyevents.createIndex({ createdAt: -1 });

// 7. Notification Audit Trail
db.createCollection('notificationrecords');
db.notificationrecords.createIndex({ id: 1 }, { unique: true });
db.notificationrecords.createIndex({ emergencyEventId: 1 });
db.notificationrecords.createIndex({ userId: 1 });
db.notificationrecords.createIndex({ sentAt: -1 });

print('>>> Seeding Default Blind Stick User & Primary Caregiver...');

// Seed User: Alex Johnson
db.users.updateOne(
  { id: 'usr_001' },
  {
    $setOnInsert: {
      id: 'usr_001',
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
      passwordHash: 'password123',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },
  { upsert: true }
);

// Seed Caregiver: Sarah Johnson
db.users.updateOne(
  { id: 'usr_caregiver_001' },
  {
    $setOnInsert: {
      id: 'usr_caregiver_001',
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
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },
  { upsert: true }
);

// Seed Hardware Device: ESP32 Smart Stick
db.devices.updateOne(
  { id: 'STICK_001' },
  {
    $setOnInsert: {
      id: 'STICK_001',
      userId: 'usr_001',
      deviceName: 'ESP32 Smart Stick Pro (v1.4)',
      apiKeyHash: 'esp32_smartstick_auth_token_secret',
      isConnected: true,
      batteryLevel: 84,
      batteryVoltage: 4.12,
      gpsStatus: 'ACTIVE',
      wifiStatus: 'CONNECTED',
      wifiRssi: -58,
      emergencyButtonStatus: 'READY',
      buzzerActive: false,
      firmwareVersion: 'v1.4.2-esp32',
      lastCommunicationAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },
  { upsert: true }
);

// Seed Emergency Contacts
db.emergencycontacts.updateOne(
  { id: 'cnt_001' },
  {
    $setOnInsert: {
      id: 'cnt_001',
      userId: 'usr_001',
      contactName: 'Sarah Johnson',
      relationship: 'Mother / Primary Caregiver',
      phoneNumber: '+1 (555) 987-6543',
      email: 'sarah.caregiver@smartstick.io',
      notificationPreference: 'ALL',
      priority: 'PRIMARY',
      isAuthorizedCaregiver: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },
  { upsert: true }
);

db.emergencycontacts.updateOne(
  { id: 'cnt_002' },
  {
    $setOnInsert: {
      id: 'cnt_002',
      userId: 'usr_001',
      contactName: 'Dr. Robert Miller',
      relationship: 'Primary Physician',
      phoneNumber: '+1 (555) 345-6789',
      email: 'dr.miller@cityhospital.org',
      notificationPreference: 'SMS',
      priority: 'SECONDARY',
      isAuthorizedCaregiver: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },
  { upsert: true }
);

print('>>> MongoDB Initialization & Seed completed successfully!');
