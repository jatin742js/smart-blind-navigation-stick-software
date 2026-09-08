import React from 'react';
import {
  AlertTriangle,
  Volume2,
  VolumeX,
  Eye,
  Activity,
  BatteryCharging,
  BatteryMedium,
  BatteryLow,
  Wifi,
  WifiOff,
  UserCheck,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';

interface NavbarProps {
  onToggleSimulation: () => void;
  showSimulation: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSimulation, showSimulation }) => {
  const { user, switchRoleDemo, highContrast, setHighContrast, voiceAnnouncements, setVoiceAnnouncements } = useAuth();
  const { device, activeEmergency, triggerEmergency, countdownSeconds } = useDevice();

  const getBatteryIcon = (level: number = 100) => {
    if (level < 20) return <BatteryLow className="w-5 h-5 text-red-500 animate-pulse" />;
    if (level < 50) return <BatteryMedium className="w-5 h-5 text-amber-400" />;
    return <BatteryCharging className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-xs">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                SmartStick <span className="text-amber-700 text-xs px-2 py-0.5 rounded bg-amber-100 border border-amber-300 font-mono font-semibold">ESP32</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Blind Navigation & Emergency System</p>
          </div>
        </div>

        {/* Center: Device Quick Status Pill */}
        <div className="hidden md:flex items-center gap-3 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs text-slate-700 shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${device?.isConnected ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-red-500 ring-2 ring-red-500/20'}`} />
            <span className="font-medium">{device?.isConnected ? 'Stick Online' : 'Offline'}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 font-medium">
            {getBatteryIcon(device?.batteryLevel)}
            <span className="font-mono">{device?.batteryLevel ?? 84}%</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 font-medium">
            {device?.wifiStatus === 'CONNECTED' ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-red-500" />
            )}
            <span>GPS: <strong className="text-emerald-700">{device?.gpsStatus ?? 'ACTIVE'}</strong></span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Accessibility Voice Toggle */}
          <button
            onClick={() => setVoiceAnnouncements(!voiceAnnouncements)}
            title={voiceAnnouncements ? 'Mute Voice Announcements' : 'Enable Voice Announcements'}
            aria-label={voiceAnnouncements ? 'Voice alerts enabled' : 'Voice alerts muted'}
            className={`p-2 rounded-xl border transition-colors shadow-xs ${
              voiceAnnouncements
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {voiceAnnouncements ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* High Contrast Mode Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            title="Toggle High-Contrast Accessibility Mode"
            aria-label="High contrast mode"
            className={`p-2 rounded-xl border transition-colors shadow-xs ${
              highContrast
                ? 'bg-yellow-400 border-yellow-400 text-slate-950 font-bold'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-5 h-5" />
          </button>

          {/* Simulation Mode Toggle Button */}
          <button
            onClick={onToggleSimulation}
            title="Toggle Simulation & Demo Mode"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs ${
              showSimulation
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Demo Lab</span>
          </button>

          {/* Role Switcher Pill */}
          <button
            onClick={() => switchRoleDemo(user?.role === 'caregiver' ? 'user' : 'caregiver')}
            title="Switch between Stick User and Caregiver views"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium hover:bg-slate-50 transition shadow-xs"
          >
            <UserCheck className="w-4 h-4 text-cyan-600" />
            <span className="text-slate-700 capitalize hidden sm:inline font-semibold">
              {user?.role === 'caregiver' ? 'Caregiver Mode' : 'Ward/User Mode'}
            </span>
          </button>

          {/* Prominent Emergency Action Trigger */}
          <button
            onClick={() => triggerEmergency('MANUAL_APP')}
            disabled={activeEmergency !== null}
            aria-label="Trigger SOS Emergency Alarm"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-sm transition-all shadow-md focus:outline-none focus:ring-4 ${
              activeEmergency
                ? 'bg-red-700 text-white animate-pulse focus:ring-red-400'
                : 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500/50 active:scale-95'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="tracking-wide">
              {activeEmergency
                ? countdownSeconds !== null
                  ? `SOS (${countdownSeconds}s)`
                  : 'SOS ACTIVE'
                : 'SOS'}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
