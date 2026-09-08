-- ====================================================================
-- Smart Blind Navigation Stick - Normalized Database Schema
-- Compatible with PostgreSQL 13+ and MySQL 8+
-- ====================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'caregiver', 'admin')),
    profile_photo_url TEXT,
    emergency_medical_info TEXT,
    blood_group VARCHAR(10),
    address TEXT,
    accessibility_voice_enabled BOOLEAN DEFAULT TRUE,
    high_contrast_enabled BOOLEAN DEFAULT FALSE,
    cancellation_timer_seconds INT DEFAULT 20,
    tracking_interval_seconds INT DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. Devices Table (ESP32 Smart Sticks)
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(100) NOT NULL DEFAULT 'ESP32 Smart Stick',
    api_key_hash VARCHAR(255) NOT NULL,
    is_connected BOOLEAN DEFAULT FALSE,
    battery_level INT DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
    battery_voltage NUMERIC(4,2) DEFAULT 4.15,
    gps_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (gps_status IN ('ACTIVE', 'SEARCHING', 'OFFLINE')),
    wifi_status VARCHAR(20) DEFAULT 'CONNECTED' CHECK (wifi_status IN ('CONNECTED', 'DISCONNECTED', 'POOR_SIGNAL')),
    wifi_rssi INT DEFAULT -62,
    emergency_button_status VARCHAR(20) DEFAULT 'READY' CHECK (emergency_button_status IN ('READY', 'TRIGGERED', 'DISABLED')),
    buzzer_active BOOLEAN DEFAULT FALSE,
    firmware_version VARCHAR(20) DEFAULT 'v1.4.2-esp32',
    last_communication_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_devices_user_id ON devices(user_id);

-- 3. Emergency Contacts Table
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL,
    notification_preference VARCHAR(20) DEFAULT 'ALL' CHECK (notification_preference IN ('SMS', 'EMAIL', 'PUSH', 'ALL')),
    priority VARCHAR(20) DEFAULT 'PRIMARY' CHECK (priority IN ('PRIMARY', 'SECONDARY', 'TERTIARY')),
    is_authorized_caregiver BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emergency_contacts_user ON emergency_contacts(user_id);
CREATE INDEX idx_emergency_contacts_priority ON emergency_contacts(priority);

-- 4. Ultrasonic Sensor Data Table
CREATE TABLE IF NOT EXISTS device_sensor_data (
    id VARCHAR(36) PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    front_distance_cm NUMERIC(6,2) NOT NULL,
    left_distance_cm NUMERIC(6,2) NOT NULL,
    right_distance_cm NUMERIC(6,2) NOT NULL,
    front_obstacle BOOLEAN DEFAULT FALSE,
    left_obstacle BOOLEAN DEFAULT FALSE,
    right_obstacle BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sensor_data_device_time ON device_sensor_data(device_id, recorded_at DESC);

-- 5. Location Tracking Table
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(50) NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    accuracy_meters NUMERIC(6, 2) DEFAULT 5.0,
    speed_kmh NUMERIC(5, 2) DEFAULT 0.0,
    heading_deg NUMERIC(5, 2) DEFAULT 0.0,
    gps_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (gps_status IN ('ACTIVE', 'SEARCHING', 'LAST_KNOWN')),
    is_live_tracking BOOLEAN DEFAULT TRUE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_locations_user_time ON locations(user_id, recorded_at DESC);
CREATE INDEX idx_locations_device_time ON locations(device_id, recorded_at DESC);

-- 6. Emergency Events Table
CREATE TABLE IF NOT EXISTS emergency_events (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(50) NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    accuracy_meters NUMERIC(6, 2),
    location_address TEXT,
    google_maps_url TEXT,
    event_trigger VARCHAR(50) DEFAULT 'PHYSICAL_BUTTON' CHECK (event_trigger IN ('PHYSICAL_BUTTON', 'MANUAL_APP', 'FALL_DETECTION', 'SIMULATED')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('PENDING_CONFIRMATION', 'ACTIVE', 'RESOLVED', 'CANCELLED', 'FAILED')),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emergency_events_user_status ON emergency_events(user_id, status);
CREATE INDEX idx_emergency_events_created ON emergency_events(created_at DESC);

-- 7. Notifications Log Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    emergency_event_id VARCHAR(36) REFERENCES emergency_events(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_name VARCHAR(100) NOT NULL,
    recipient_destination VARCHAR(150) NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('SMS', 'EMAIL', 'PUSH')),
    message_content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'SENDING' CHECK (status IN ('SENDING', 'SENT', 'DELIVERED', 'FAILED')),
    provider_reference_id VARCHAR(100),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_event ON notifications(emergency_event_id);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);

-- 8. Caregiver Authorization Permissions
CREATE TABLE IF NOT EXISTS caregiver_permissions (
    id VARCHAR(36) PRIMARY KEY,
    caregiver_user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    can_view_live_location BOOLEAN DEFAULT TRUE,
    can_view_emergency_alerts BOOLEAN DEFAULT TRUE,
    can_trigger_device_buzzer BOOLEAN DEFAULT TRUE,
    can_view_health_status BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED', 'PENDING')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(caregiver_user_id, patient_user_id)
);

CREATE INDEX idx_caregiver_patient ON caregiver_permissions(caregiver_user_id, patient_user_id);

-- 9. Location Sharing Policies
CREATE TABLE IF NOT EXISTS location_sharing (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    is_live_sharing_enabled BOOLEAN DEFAULT TRUE,
    share_with_all_contacts BOOLEAN DEFAULT TRUE,
    high_accuracy_mode BOOLEAN DEFAULT TRUE,
    auto_share_on_emergency BOOLEAN DEFAULT TRUE,
    last_toggle_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
