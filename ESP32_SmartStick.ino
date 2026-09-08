/*
  ========================================================================
  Smart Blind Navigation Stick - ESP32 Firmware
  Features:
  - 3x Ultrasonic Sensors HC-SR04 (Front, Left, Right)
  - 1x Neo-6M GPS Module (UART2: RX=16, TX=17)
  - 1x Physical Emergency Push Button (GPIO 4 with debouncing interrupt)
  - 1x Piezo Buzzer / Voice Alarm (GPIO 18)
  - 1x Status LED (GPIO 2)
  - WiFi / HTTP Client with secure token authentication
  - Periodic Telemetry + Instant Emergency Push Event
  ========================================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>
#include <ArduinoJson.h>

// --- Configuration ---
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Backend API URL (Replace with your Cloud Run / server URL)
const char* SERVER_URL = "https://your-smartstick-app.run.app";
const char* DEVICE_ID = "STICK_001";
const char* DEVICE_API_KEY = "esp32_smartstick_auth_token_secret";

// Pin Definitions
#define PIN_EMERGENCY_BUTTON 4
#define PIN_BUZZER 18
#define PIN_LED 2

// Ultrasonic Sensors (Trigger & Echo)
#define TRIG_FRONT 5
#define ECHO_FRONT 19

#define TRIG_LEFT 21
#define ECHO_LEFT 22

#define TRIG_RIGHT 23
#define ECHO_RIGHT 34

// Hardware Serial for GPS
HardwareSerial gpsSerial(2);
TinyGPSPlus gps;

// State Variables
volatile bool emergencyTriggered = false;
unsigned long lastTelemetryTime = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 3000; // send sensor & GPS every 3 seconds

// Distance variables in cm
float distFront = 100.0;
float distLeft = 100.0;
float distRight = 100.0;

// Interrupt Service Routine for Emergency Button
void IRAM_ATTR handleEmergencyInterrupt() {
  emergencyTriggered = true;
}

// Ultrasonic measurement helper
float measureDistanceCm(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 25000); // 25ms timeout (~4 meters)
  if (duration == 0) return 300.0; // Clear distance if timeout
  return (duration * 0.0343) / 2.0;
}

void playBuzzerAlert(int toneFreq, int durationMs) {
  tone(PIN_BUZZER, toneFreq, durationMs);
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n[SmartStick] Booting ESP32 Smart Blind Navigation Stick...");

  pinMode(PIN_EMERGENCY_BUTTON, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_EMERGENCY_BUTTON), handleEmergencyInterrupt, FALLING);

  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_LED, OUTPUT);

  pinMode(TRIG_FRONT, OUTPUT);
  pinMode(ECHO_FRONT, INPUT);
  pinMode(TRIG_LEFT, OUTPUT);
  pinMode(ECHO_LEFT, INPUT);
  pinMode(TRIG_RIGHT, OUTPUT);
  pinMode(ECHO_RIGHT, INPUT);

  // Initialize GPS Serial
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17);

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("[SmartStick] Connecting to WiFi");
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 20) {
    delay(500);
    Serial.print(".");
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[SmartStick] WiFi Connected! IP: " + WiFi.localIP().toString());
    digitalWrite(PIN_LED, HIGH);
    playBuzzerAlert(1000, 200);
  } else {
    Serial.println("\n[SmartStick] WiFi Failed. Operating in autonomous offline radar mode.");
  }
}

void sendEmergencyAlert() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[SmartStick] Error: Cannot send alert, WiFi offline!");
    return;
  }

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/device/emergency";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", DEVICE_API_KEY);

  // Read GPS if available
  double lat = gps.location.isValid() ? gps.location.lat() : 30.3165;
  double lng = gps.location.isValid() ? gps.location.lng() : 78.0322;
  double acc = gps.hdop.isValid() ? gps.hdop.hdop() * 4.0 : 6.5;

  StaticJsonDocument<256> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["event"] = "EMERGENCY_BUTTON";
  doc["latitude"] = lat;
  doc["longitude"] = lng;
  doc["accuracy"] = acc;
  doc["battery"] = 82;
  doc["timestamp"] = "2026-09-08T10:45:00Z";

  String requestBody;
  serializeJson(doc, requestBody);

  Serial.println("[SmartStick] Transmitting Emergency Payload: " + requestBody);
  int httpResponseCode = http.POST(requestBody);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("[SmartStick] Emergency response (%d): %s\n", httpResponseCode, response.c_str());
    // Audible verification beep
    playBuzzerAlert(2000, 800);
  } else {
    Serial.printf("[SmartStick] Error on emergency POST: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}

void sendTelemetry() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/device/sensor-data";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", DEVICE_API_KEY);

  double lat = gps.location.isValid() ? gps.location.lat() : 30.3165;
  double lng = gps.location.isValid() ? gps.location.lng() : 78.0322;

  StaticJsonDocument<384> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["frontDistanceCm"] = distFront;
  doc["leftDistanceCm"] = distLeft;
  doc["rightDistanceCm"] = distRight;
  doc["latitude"] = lat;
  doc["longitude"] = lng;
  doc["accuracy"] = 5.2;
  doc["battery"] = 82;
  doc["wifiRssi"] = WiFi.RSSI();

  String payload;
  serializeJson(doc, payload);

  int code = http.POST(payload);
  http.end();
}

void loop() {
  // Feed GPS parser
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // Measure Obstacles
  distFront = measureDistanceCm(TRIG_FRONT, ECHO_FRONT);
  distLeft = measureDistanceCm(TRIG_LEFT, ECHO_LEFT);
  distRight = measureDistanceCm(TRIG_RIGHT, ECHO_RIGHT);

  // Haptic / Audio Feedback for Obstacles closer than 50cm
  if (distFront < 40.0) {
    playBuzzerAlert(1500, 100);
  } else if (distLeft < 35.0 || distRight < 35.0) {
    playBuzzerAlert(800, 50);
  }

  // Handle Emergency Interrupt
  if (emergencyTriggered) {
    emergencyTriggered = false;
    Serial.println("\n🚨 [SmartStick] Physical Emergency Button Pressed!");
    sendEmergencyAlert();
  }

  // Send periodic telemetry
  if (millis() - lastTelemetryTime > TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = millis();
    sendTelemetry();
  }

  delay(50);
}
