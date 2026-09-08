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
  Cpu,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';

interface NavbarProps {
  onToggleSimulation: () => void;
  showSimulation: boolean;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSimulation,
  showSimulation,
  mobileMenuOpen = false,
  onToggleMobileMenu,
}) => {
  const { user, logout, switchRoleDemo, highContrast, setHighContrast, voiceAnnouncements, setVoiceAnnouncements } = useAuth();
  const { device, activeEmergency, triggerEmergency, countdownSeconds } = useDevice();

  const getBatteryIcon = (level: number = 100) => {
    if (level < 20) return <BatteryLow className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-pulse" />;
    if (level < 50) return <BatteryMedium className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />;
    return <BatteryCharging className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Identity */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-xs shrink-0">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                SmartStick <span className="text-amber-700 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded bg-amber-100 border border-amber-300 font-mono font-semibold hidden xs:inline">ESP32</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">Blind Navigation & Emergency System</p>
          </div>
        </div>

        {/* Center: Device Quick Status Pill (Desktop: Full, Mobile: Compact) */}
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

        {/* Mobile Mini Status Pill (Visible on small screens) */}
        <div className="flex md:hidden items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-full border border-slate-200 text-[11px] text-slate-700 font-medium shadow-2xs">
          <span className={`w-2 h-2 rounded-full shrink-0 ${device?.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          {getBatteryIcon(device?.batteryLevel)}
          <span className="font-mono font-bold text-slate-800">{device?.batteryLevel ?? 84}%</span>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Accessibility Voice Toggle (Visible on sm+) */}
          <button
            onClick={() => setVoiceAnnouncements(!voiceAnnouncements)}
            title={voiceAnnouncements ? 'Mute Voice Announcements' : 'Enable Voice Announcements'}
            aria-label={voiceAnnouncements ? 'Voice alerts enabled' : 'Voice alerts muted'}
            className={`hidden sm:flex p-2 rounded-xl border transition-colors shadow-xs ${
              voiceAnnouncements
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {voiceAnnouncements ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* High Contrast Mode Toggle (Visible on sm+) */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            title="Toggle High-Contrast Accessibility Mode"
            aria-label="High contrast mode"
            className={`hidden sm:flex p-2 rounded-xl border transition-colors shadow-xs ${
              highContrast
                ? 'bg-yellow-400 border-yellow-400 text-slate-950 font-bold'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Simulation Mode Toggle Button (Visible on md+) */}
          <button
            onClick={onToggleSimulation}
            title="Toggle Simulation & Demo Mode"
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs ${
              showSimulation
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>Demo Lab</span>
          </button>

          {/* Role Switcher Pill (Visible on md+) */}
          <button
            onClick={() => switchRoleDemo(user?.role === 'caregiver' ? 'user' : 'caregiver')}
            title="Switch between Stick User and Caregiver views"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium hover:bg-slate-50 transition shadow-xs"
          >
            <UserCheck className="w-4 h-4 text-cyan-600" />
            <span className="text-slate-700 capitalize font-semibold">
              {user?.role === 'caregiver' ? 'Caregiver Mode' : 'Ward/User Mode'}
            </span>
          </button>

          {/* Logout Button in Header (Visible on md+) */}
          <button
            onClick={logout}
            id="navbar-logout-btn"
            title="Log out of Smart Stick"
            aria-label="Log out of Smart Stick"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-700 text-xs font-semibold transition shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-red-600" />
            <span>Log Out</span>
          </button>

          {/* Prominent Emergency Action Trigger (Always visible on all screen sizes) */}
          <button
            onClick={() => triggerEmergency('MANUAL_APP')}
            disabled={activeEmergency !== null}
            aria-label="Trigger SOS Emergency Alarm"
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md focus:outline-none focus:ring-4 shrink-0 ${
              activeEmergency
                ? 'bg-red-700 text-white animate-pulse focus:ring-red-400'
                : 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500/50 active:scale-95'
            }`}
          >
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="tracking-wide">
              {activeEmergency
                ? countdownSeconds !== null
                  ? `SOS (${countdownSeconds}s)`
                  : 'SOS ACTIVE'
                : 'SOS'}
            </span>
          </button>

          {/* Mobile Navigation Drawer Hamburger Toggle (Visible on lg:hidden) */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              id="mobile-menu-toggle-btn"
              title={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              className="lg:hidden p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 active:scale-95 transition shadow-xs shrink-0 flex items-center justify-center min-w-[40px] min-h-[40px]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
