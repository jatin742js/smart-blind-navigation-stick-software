import React, { useState } from 'react';
import { FileCode2, Copy, Check, Terminal, Cpu, Radio, AlertTriangle, Key } from 'lucide-react';

export const HardwareDocsPage: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const arduinoSnippet = `#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <TinyGPSPlus.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "https://your-domain.run.app/api/device/telemetry";
const char* emergencyUrl = "https://your-domain.run.app/api/device/emergency";
const char* deviceKey = "stick_sec_token_99x";

// Pin Configuration
#define PIN_EMERGENCY_BTN 4
#define PIN_BUZZER 18
#define PIN_FRONT_TRIG 5
#define PIN_FRONT_ECHO 19
#define PIN_LEFT_TRIG 18
#define PIN_LEFT_ECHO 21
#define PIN_RIGHT_TRIG 22
#define PIN_RIGHT_ECHO 23

// GPS HardwareSerial on UART2 (RX2: 16, TX2: 17)
HardwareSerial neogps(2);
TinyGPSPlus gps;

void setup() {
  Serial.begin(115200);
  neogps.begin(9600, SERIAL_8N1, 16, 17);

  pinMode(PIN_EMERGENCY_BTN, INPUT_PULLUP);
  pinMode(PIN_BUZZER, OUTPUT);
  attachInterrupt(digitalPinToInterrupt(PIN_EMERGENCY_BTN), onEmergencyButtonPressed, FALLING);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected!");
}

void loop() {
  while (neogps.available() > 0) {
    gps.encode(neogps.read());
  }

  // Measure Ultrasonics
  float frontDist = measureDistanceCm(PIN_FRONT_TRIG, PIN_FRONT_ECHO);
  float leftDist  = measureDistanceCm(PIN_LEFT_TRIG,  PIN_LEFT_ECHO);
  float rightDist = measureDistanceCm(PIN_RIGHT_TRIG, PIN_RIGHT_ECHO);

  // Send periodic telemetry (every 5 seconds)
  sendTelemetry(frontDist, leftDist, rightDist);
  delay(5000);
}`;

  const curlTelemetrySnippet = `curl -X POST https://your-server.com/api/device/telemetry \\
  -H "Content-Type: application/json" \\
  -H "x-device-key: stick_sec_token_99x" \\
  -d '{
    "deviceId": "STICK_001",
    "battery": { "levelPercent": 84, "voltage": 4.12 },
    "sensors": {
      "frontDistanceCm": 85.0,
      "leftDistanceCm": 120.0,
      "rightDistanceCm": 35.0,
      "frontObstacle": false
    },
    "location": {
      "latitude": 30.31650,
      "longitude": 78.03220,
      "accuracyMeters": 4.5,
      "speedKmh": 1.2,
      "gpsStatus": "ACTIVE"
    },
    "emergencyButton": { "pressed": false }
  }'`;

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <FileCode2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">ESP32 Hardware & REST API Documentation</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Circuit schematics, pinout mapping, and full C++ firmware for the smart stick
            </p>
          </div>
        </div>
      </div>

      {/* Pinout Table */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-600" />
          Hardware Pinout Table (ESP32-WROOM-32)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Component</th>
                <th className="px-4 py-2.5">Hardware Module</th>
                <th className="px-4 py-2.5">ESP32 Pin</th>
                <th className="px-4 py-2.5">Mode / Interface</th>
                <th className="px-4 py-2.5">Function</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              <tr className="hover:bg-slate-50/70 transition">
                <td className="px-4 py-2 text-slate-900 font-bold">Emergency Push Button</td>
                <td className="px-4 py-2 text-slate-600">Tactile Push Button</td>
                <td className="px-4 py-2 text-amber-700 font-bold">GPIO 4</td>
                <td className="px-4 py-2 text-slate-600">INPUT_PULLUP (Interrupt)</td>
                <td className="px-4 py-2 text-slate-500">Detects emergency triggers instantly</td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition">
                <td className="px-4 py-2 text-slate-900 font-bold">Front Ultrasonic</td>
                <td className="px-4 py-2 text-slate-600">HC-SR04 Sonar</td>
                <td className="px-4 py-2 text-cyan-700 font-bold">TRIG: 5, ECHO: 19</td>
                <td className="px-4 py-2 text-slate-600">Digital I/O</td>
                <td className="px-4 py-2 text-slate-500">Center path obstacle detection</td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition">
                <td className="px-4 py-2 text-slate-900 font-bold">Left Ultrasonic</td>
                <td className="px-4 py-2 text-slate-600">HC-SR04 Sonar</td>
                <td className="px-4 py-2 text-cyan-700 font-bold">TRIG: 18, ECHO: 21</td>
                <td className="px-4 py-2 text-slate-600">Digital I/O</td>
                <td className="px-4 py-2 text-slate-500">Left side flank detection</td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition">
                <td className="px-4 py-2 text-slate-900 font-bold">Right Ultrasonic</td>
                <td className="px-4 py-2 text-slate-600">HC-SR04 Sonar</td>
                <td className="px-4 py-2 text-cyan-700 font-bold">TRIG: 22, ECHO: 23</td>
                <td className="px-4 py-2 text-slate-600">Digital I/O</td>
                <td className="px-4 py-2 text-slate-500">Right side flank detection</td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition">
                <td className="px-4 py-2 text-slate-900 font-bold">GPS Receiver</td>
                <td className="px-4 py-2 text-slate-600">u-blox Neo-6M</td>
                <td className="px-4 py-2 text-blue-700 font-bold">RX2: 16, TX2: 17</td>
                <td className="px-4 py-2 text-slate-600">UART2 @ 9600 Baud</td>
                <td className="px-4 py-2 text-slate-500">Latitude, Longitude, Altitude, Speed</td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition">
                <td className="px-4 py-2 text-slate-900 font-bold">Piezo Buzzer</td>
                <td className="px-4 py-2 text-slate-600">Active/Passive Buzzer</td>
                <td className="px-4 py-2 text-purple-700 font-bold">GPIO 18</td>
                <td className="px-4 py-2 text-slate-600">PWM Output</td>
                <td className="px-4 py-2 text-slate-500">Audible obstacle warnings & stick finder</td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition">
                <td className="px-4 py-2 text-slate-900 font-bold">Battery Monitor</td>
                <td className="px-4 py-2 text-slate-600">Voltage Divider (100k/100k)</td>
                <td className="px-4 py-2 text-emerald-700 font-bold">GPIO 34 (ADC1)</td>
                <td className="px-4 py-2 text-slate-600">Analog In (12-bit)</td>
                <td className="px-4 py-2 text-slate-500">Measures battery level and charge percentage</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* REST API Endpoints Guide */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-600" />
          Hardware Ingestion REST Endpoints
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                POST /api/device/telemetry
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Header: x-device-key</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Periodic health packet sent every 3–10s containing battery %, 3 sonar distances, and GPS coordinates.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-red-50 text-red-800 border border-red-200">
                POST /api/device/emergency
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Header: x-device-key</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Interrupt-driven emergency push packet triggering the countdown and SMS/Email dispatch sequence.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                POST /api/device/buzzer
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Auth: Bearer JWT</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Allows caregiver dashboard to remotely beep the cane to help visually impaired users locate it.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
                GET /api/device/stream
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Server-Sent Events</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Real-time SSE event pipeline streaming hardware telemetry to web dashboards with sub-second latency.
            </p>
          </div>

        </div>
      </div>

      {/* Arduino Firmware Source Code */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">ESP32 Smart Stick Firmware (<code className="text-amber-600">ESP32_SmartStick.ino</code>)</h3>
          </div>
          <button
            onClick={() => copyToClipboard(arduinoSnippet, setCopiedCode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-96">
{arduinoSnippet}
        </pre>
      </div>

    </div>
  );
};
