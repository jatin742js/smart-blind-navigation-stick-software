import React from 'react';
import {
  Cpu,
  Battery,
  Wifi,
  WifiOff,
  Navigation,
  AlertCircle,
  Volume2,
  CheckCircle2,
  Radio,
  Clock
} from 'lucide-react';
import { useDevice } from '../context/DeviceContext';

export const DeviceHealthCard: React.FC = () => {
  const { device, sensor } = useDevice();

  const isConnected = device?.isConnected ?? true;
  const battery = device?.batteryLevel ?? 84;
  const voltage = device?.batteryVoltage ?? 4.12;
  const gpsStatus = device?.gpsStatus ?? 'ACTIVE';
  const wifiStatus = device?.wifiStatus ?? 'CONNECTED';
  const wifiRssi = device?.wifiRssi ?? -58;
  const buttonStatus = device?.emergencyButtonStatus ?? 'READY';
  const buzzerActive = device?.buzzerActive ?? false;
  const lastComm = device?.lastCommunicationAt ? new Date(device.lastCommunicationAt).toLocaleTimeString() : 'Just now';

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">{device?.deviceName || 'ESP32 Smart Stick Hardware'}</h3>
            <p className="text-xs text-slate-500">Firmware: {device?.firmwareVersion || 'v1.4.2-esp32'}</p>
          </div>
        </div>

        {/* Global Connection Status Pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
          isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span>{isConnected ? 'Device Connected 🟢' : 'Disconnected 🔴'}</span>
        </div>
      </div>

      {/* Grid of Hardware Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
        
        {/* Battery Level */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Battery className="w-3.5 h-3.5 text-amber-600" />
              Battery
            </span>
            <span className="font-mono text-[11px] text-slate-500">{voltage.toFixed(2)}V</span>
          </div>
          <p className="text-xl font-black font-mono text-slate-900">
            {battery}%
          </p>
          <div className="w-full h-1.5 rounded-full bg-slate-200 mt-2 overflow-hidden">
            <div
              className={`h-full ${battery < 20 ? 'bg-red-500' : battery < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${battery}%` }}
            />
          </div>
        </div>

        {/* GPS Module Status */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              GPS Module
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-1">
            <span className={`w-2 h-2 rounded-full ${gpsStatus === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {gpsStatus === 'ACTIVE' ? 'Available 🟢' : 'Searching 🟡'}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Neo-6M UART2</span>
        </div>

        {/* WiFi / Internet */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              {wifiStatus === 'CONNECTED' ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-red-500" />}
              Internet/Wi-Fi
            </span>
            <span className="text-[11px] font-mono text-slate-500">{wifiRssi} dBm</span>
          </div>
          <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-1">
            <span className={`w-2 h-2 rounded-full ${wifiStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {wifiStatus === 'CONNECTED' ? 'Connected 🟢' : 'Offline 🔴'}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">WPA2 Enterprise</span>
        </div>

        {/* Emergency Push Button */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              Emergency Button
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-1">
            <span className={`w-2 h-2 rounded-full ${buttonStatus === 'READY' ? 'bg-emerald-500' : 'bg-red-500 animate-ping'}`} />
            {buttonStatus === 'READY' ? 'Ready 🟢' : 'Triggered 🔴'}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">GPIO 4 Interrupt</span>
        </div>

        {/* Ultrasonic Sensors */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-600" />
              Ultrasonics
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            3 Active 🟢
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">HC-SR04 (F / L / R)</span>
        </div>

        {/* Voice / Buzzer */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-purple-600" />
              Buzzer / Voice
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-1">
            <span className={`w-2 h-2 rounded-full ${buzzerActive ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            {buzzerActive ? 'Beeping 🔊' : 'Ready 🟢'}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">GPIO 18 Piezo</span>
        </div>

      </div>

      {/* Footer Last Communication */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          Last communication: <strong className="text-slate-800">{lastComm}</strong>
        </span>
        <span className="text-slate-400 text-[11px]">Heartbeat: 3000ms</span>
      </div>

    </div>
  );
};
