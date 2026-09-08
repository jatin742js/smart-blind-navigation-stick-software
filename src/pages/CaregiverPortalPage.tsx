import React, { useState } from 'react';
import {
  HeartHandshake,
  Navigation,
  Phone,
  Mail,
  ShieldAlert,
  Volume2,
  Battery,
  Wifi,
  ExternalLink,
  MapPin,
  CheckCircle,
  AlertTriangle,
  History,
  Clock,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';
import { InteractiveMap } from '../components/InteractiveMap';
import { EmergencyBanner } from '../components/EmergencyBanner';

export const CaregiverPortalPage: React.FC = () => {
  const { user, switchRoleDemo } = useAuth();
  const { device, currentLocation, locationTrail, activeEmergency, triggerBuzzer, isLiveTrackingActive, toggleLiveTracking } = useDevice();
  const [buzzerSent, setBuzzerSent] = useState(false);

  const handleLocateStick = async () => {
    setBuzzerSent(true);
    await triggerBuzzer();
    setTimeout(() => setBuzzerSent(false), 3000);
  };

  const wardUser = {
    name: 'Alex Johnson',
    phone: '+1 (555) 234-5678',
    email: 'alex@smartstick.io',
    bloodGroup: 'O+',
    medicalNotes: 'Visually impaired (total blindness). Diabetic Type 1.',
    address: '42 Pine Crest Avenue, Dehradun, UK 248001',
  };

  const hasCoords = currentLocation && currentLocation.latitude !== null && currentLocation.longitude !== null;
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`
    : '#';

  return (
    <div className="space-y-6">
      
      {/* Active Emergency Banner if any */}
      <EmergencyBanner />

      {/* Header with Role Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Caregiver Remote Guardian Portal</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                Guardian View
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized caregiver console for monitoring ward safety, real-time GPS, and emergency response
            </p>
          </div>
        </div>

        {/* Remote Locate Stick Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLocateStick}
            disabled={buzzerSent}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
            <span>{buzzerSent ? 'Emitting Beep...' : 'Locate Stick (Audible Buzzer)'}</span>
          </button>
        </div>
      </div>

      {/* Ward Info & Quick Hardware Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ward Info Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Monitored Ward</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Link
            </span>
          </div>

          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-lg">
              AJ
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900">{wardUser.name}</h4>
              <p className="text-xs text-slate-500">{wardUser.address}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Emergency Phone:</span>
              <a href={`tel:${wardUser.phone}`} className="font-mono text-cyan-600 hover:underline flex items-center gap-1 font-semibold">
                <Phone className="w-3 h-3" />
                {wardUser.phone}
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Blood Group:</span>
              <span className="font-mono font-bold text-rose-600">{wardUser.bloodGroup}</span>
            </div>
            <div className="pt-1">
              <span className="text-slate-500 block mb-0.5">Medical Conditions:</span>
              <p className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {wardUser.medicalNotes}
              </p>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <a
              href={`tel:${wardUser.phone}`}
              className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Ward</span>
            </a>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>Directions</span>
            </a>
          </div>
        </div>

        {/* Remote Stick Telemetry */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Stick Telemetry & Power Status</h3>
            <span className="text-xs text-slate-500 font-mono">
              Last Sync: {device?.lastCommunicationAt ? new Date(device.lastCommunicationAt).toLocaleTimeString() : 'Just now'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block mb-1">Battery Level</span>
              <p className="text-xl font-mono font-black text-slate-900">{device?.batteryLevel ?? 84}%</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Healthy (4.12V)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block mb-1">Hardware Link</span>
              <p className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Connected
              </p>
              <span className="text-[10px] text-slate-500">Wi-Fi / Cellular</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block mb-1">GPS Lock</span>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Available 🟢
              </p>
              <span className="text-[10px] text-slate-500">Accuracy ±4m</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block mb-1">Emergency Button</span>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Armed & Ready
              </p>
              <span className="text-[10px] text-slate-500">GPIO 4 Pullup</span>
            </div>
          </div>

          {/* Quick Caregiver Instructions */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <strong className="text-slate-900 block">Emergency Protocol for Caregivers:</strong>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              If an SOS event occurs, you will immediately receive an automated phone call, high-priority SMS, and push notification containing exact coordinates. Use the map below to navigate to the user or dispatch first responders.
            </p>
          </div>
        </div>

      </div>

      {/* Ward Real-Time Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-amber-500" />
            <span>Ward Live Location & Path</span>
          </h3>
          <button
            onClick={toggleLiveTracking}
            className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
          >
            {isLiveTrackingActive ? 'Tracking: ON' : 'Tracking: PAUSED'}
          </button>
        </div>

        <InteractiveMap
          currentLocation={currentLocation}
          locationTrail={locationTrail}
          isLiveTrackingActive={isLiveTrackingActive}
          onToggleLiveTracking={toggleLiveTracking}
          heightClass="h-[460px]"
        />
      </div>

    </div>
  );
};
