import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Battery,
  Wifi,
  Navigation,
  Volume2,
  AlertCircle,
  Radio,
  Clock,
  Key,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Activity,
  Database,
  Server,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useDevice } from '../context/DeviceContext';
import { DeviceHealthCard } from '../components/DeviceHealthCard';
import { api } from '../api/client';

export const DeviceStatusPage: React.FC = () => {
  const { device, sensor, currentLocation, triggerBuzzer, refreshTelemetry } = useDevice();
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [mongoStatus, setMongoStatus] = useState<{ isConnected: boolean; uri: string; dbName: string; error?: string } | null>(null);

  useEffect(() => {
    api.getDatabaseStatus()
      .then(res => setMongoStatus(res.status))
      .catch(() => setMongoStatus({ isConnected: false, uri: 'mongodb://localhost:27017/smartstick_db', dbName: 'smartstick_db' }));
  }, []);

  const handleTestPing = async () => {
    setPingStatus('Sending buzzer command...');
    try {
      await triggerBuzzer();
      setPingStatus('Buzzer test tone activated on ESP32!');
      setTimeout(() => setPingStatus(null), 3500);
    } catch (err) {
      setPingStatus('Failed to send buzzer command');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Device Hardware Diagnostics</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live telemetry, peripheral bus status, and hardware heartbeat monitor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshTelemetry()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Poll Telemetry</span>
          </button>
          <button
            onClick={handleTestPing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
            <span>Ping Stick Buzzer</span>
          </button>
        </div>
      </div>

      {pingStatus && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold animate-fadeIn flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-600 animate-spin" />
          <span>{pingStatus}</span>
        </div>
      )}

      {/* Main Hardware Overview */}
      <DeviceHealthCard />

      {/* Deep Component Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* ESP32 Controller Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              Microcontroller Specs
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              ESP32-WROOM-32
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">Architecture:</span>
              <span className="font-mono text-slate-900">Xtensa Dual-Core 240MHz</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Flash Memory:</span>
              <span className="font-mono text-slate-900">4MB SPI Flash</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Firmware Build:</span>
              <span className="font-mono text-amber-600 font-semibold">{device?.firmwareVersion || 'v1.4.2-prod'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Device Hardware ID:</span>
              <span className="font-mono text-slate-700">{device?.id || 'STICK_001'}</span>
            </div>
          </div>
        </div>

        {/* Battery & Power Subsystem */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Battery className="w-4 h-4 text-amber-500" />
              Power & Fuel Gauge
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Li-Ion 18650 3.7V
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">Battery Level:</span>
              <span className="font-mono font-bold text-slate-900">{device?.batteryLevel ?? 84}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ADC Rail Voltage:</span>
              <span className="font-mono text-amber-700 font-semibold">{device?.batteryVoltage?.toFixed(2) ?? '4.12'} V</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Charging Circuit:</span>
              <span className="text-emerald-700 font-semibold">TP4056 with Protection</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated Runtime:</span>
              <span className="font-mono text-slate-800">~14.5 Hours remaining</span>
            </div>
          </div>
        </div>

        {/* Networking & Security */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              Security & Auth Token
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
              x-device-key
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">WiFi SSID:</span>
              <span className="font-mono text-slate-900">SmartStick_Campus_WiFi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">RSSI Strength:</span>
              <span className="font-mono text-emerald-700 font-semibold">{device?.wifiRssi ?? -58} dBm (Strong)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">API Key Fingerprint:</span>
              <span className="font-mono text-slate-500">c8f9...4a12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Transmission Encryption:</span>
              <span className="text-emerald-700 font-mono font-semibold">TLS / HTTPS</span>
            </div>
          </div>
        </div>

      </div>

      {/* MongoDB Database Health & Architecture */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">MongoDB Database Engine & Mongoose ODM</h3>
              <p className="text-[11px] text-slate-500">Primary persistence layer for users, emergency logs, telemetry, and device records</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>MongoDB Mode Active</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 block">Database Name</span>
            <span className="font-mono text-xs font-bold text-slate-900 block truncate">{mongoStatus?.dbName || 'smartstick_db'}</span>
            <span className="text-[10px] text-slate-500">MERN Stack Document DB</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 block">Target Connection URI</span>
            <span className="font-mono text-xs font-semibold text-amber-700 block truncate">{mongoStatus?.uri || 'mongodb://localhost:27017/smartstick_db'}</span>
            <span className="text-[10px] text-slate-500">Configured via MONGODB_URI</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 block">Collections Defined</span>
            <span className="font-mono text-xs font-bold text-emerald-700 block">7 Collections / Schemas</span>
            <span className="text-[10px] text-slate-500">Auto-indexed with TTL & compound keys</span>
          </div>
        </div>

        {/* Collections Schema badges */}
        <div className="pt-1">
          <span className="text-[11px] font-semibold text-slate-600 block mb-2">Registered Mongoose Schemas:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'UserSchema', count: 'users' },
              { name: 'DeviceSchema', count: 'devices' },
              { name: 'EmergencyContactSchema', count: 'emergencycontacts' },
              { name: 'EmergencyEventSchema', count: 'emergencyevents' },
              { name: 'LocationPointSchema', count: 'locationpoints' },
              { name: 'SensorDataSchema', count: 'sensordatas' },
              { name: 'NotificationRecordSchema', count: 'notificationrecords' },
            ].map(col => (
              <span key={col.name} className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span className="text-slate-900 font-medium">{col.name}</span>
                <span className="text-slate-500">({col.count})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Live Raw JSON Payload Viewer */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900">Live ESP32 Ingestion Payload (<code className="text-amber-600">/api/device/telemetry</code>)</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Auto-synchronized via SSE</span>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
{JSON.stringify(
  {
    deviceId: device?.id || 'STICK_001',
    battery: {
      levelPercent: device?.batteryLevel ?? 84,
      voltage: device?.batteryVoltage ?? 4.12,
    },
    sensors: {
      frontDistanceCm: sensor?.frontDistanceCm ?? 85.0,
      leftDistanceCm: sensor?.leftDistanceCm ?? 120.0,
      rightDistanceCm: sensor?.rightDistanceCm ?? 35.0,
      frontObstacle: sensor?.frontObstacle ?? false,
    },
    location: {
      latitude: currentLocation?.latitude ?? 30.3165,
      longitude: currentLocation?.longitude ?? 78.0322,
      accuracyMeters: currentLocation?.accuracyMeters ?? 4.2,
      speedKmh: currentLocation?.speedKmh ?? 0.0,
      gpsStatus: device?.gpsStatus ?? 'ACTIVE',
    },
    emergencyButton: {
      pressed: device?.emergencyButtonStatus === 'TRIGGERED',
      buzzerActive: device?.buzzerActive ?? false,
    },
    timestamp: device?.lastCommunicationAt || new Date().toISOString(),
  },
  null,
  2
)}
        </pre>
      </div>

    </div>
  );
};
