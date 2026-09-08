import React from 'react';
import {
  LayoutDashboard,
  Navigation,
  Radar,
  Users,
  History,
  MapPin,
  Cpu,
  Bell,
  HeartHandshake,
  FileCode2,
  Settings,
  ShieldAlert,
  LogOut,
  LogIn,
  X,
  Menu,
  Activity,
  BatteryCharging,
  BatteryMedium,
  BatteryLow,
  Wifi,
  Volume2,
  VolumeX,
  Eye,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';

export type TabId =
  | 'dashboard'
  | 'live-location'
  | 'obstacle-radar'
  | 'emergency-contacts'
  | 'emergency-history'
  | 'location-history'
  | 'device-status'
  | 'notifications'
  | 'caregiver-portal'
  | 'hardware-docs'
  | 'settings'
  | 'login';

interface SidebarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  mobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileMenuOpen = false,
  onCloseMobileMenu,
  onToggleMobileMenu,
}) => {
  const {
    user,
    logout,
    switchRoleDemo,
    highContrast,
    setHighContrast,
    voiceAnnouncements,
    setVoiceAnnouncements
  } = useAuth();
  const { device, activeEmergency } = useDevice();

  const handleTabClick = (tab: TabId) => {
    onSelectTab(tab);
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  const navItems: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; alert?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-location', label: 'Live Location', icon: Navigation, badge: 'GPS' },
    { id: 'obstacle-radar', label: 'Obstacle Radar', icon: Radar },
    { id: 'emergency-contacts', label: 'Emergency Contacts', icon: Users },
    { id: 'emergency-history', label: 'Emergency History', icon: History, alert: activeEmergency !== null },
    { id: 'location-history', label: 'Location History', icon: MapPin },
    { id: 'device-status', label: 'Device Telemetry', icon: Cpu },
    { id: 'notifications', label: 'Notification Logs', icon: Bell },
    { id: 'caregiver-portal', label: 'Caregiver Portal', icon: HeartHandshake, badge: user?.role === 'caregiver' ? 'Active' : undefined },
    { id: 'hardware-docs', label: 'ESP32 & API Docs', icon: FileCode2 },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const getBatteryIcon = (level: number = 100) => {
    if (level < 20) return <BatteryLow className="w-4 h-4 text-red-500 animate-pulse" />;
    if (level < 50) return <BatteryMedium className="w-4 h-4 text-amber-500" />;
    return <BatteryCharging className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 p-4 justify-between shadow-xs sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="space-y-5">
          
          {/* Active Emergency Indicator in sidebar if active */}
          {activeEmergency && (
            <div
              onClick={() => handleTabClick('emergency-history')}
              className="cursor-pointer p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 animate-pulse shadow-xs"
            >
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-red-900">Emergency Active</p>
                <p className="text-red-600">Click to inspect event</p>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1" aria-label="Main Desktop Navigation">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                    isActive
                      ? 'bg-amber-50 text-amber-900 border border-amber-300 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {item.badge}
                    </span>
                  )}
                  {item.alert && (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Identity Snapshot in footer with Logout Button */}
        <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-2">
          <div className="flex items-center justify-between">
            <div
              onClick={() => handleTabClick('login')}
              className="flex items-center gap-2.5 overflow-hidden cursor-pointer hover:opacity-80 transition"
              title="Click to view Account / Login page"
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center font-bold text-amber-700 shrink-0">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-slate-800 truncate">{user?.name || 'SmartStick User'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>

            <button
              type="button"
              id="sidebar-logout-btn"
              onClick={logout}
              title="Log Out of System"
              aria-label="Log Out of System"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <button
              type="button"
              onClick={() => handleTabClick('login')}
              className={`font-semibold hover:underline flex items-center gap-1 ${
                currentTab === 'login' ? 'text-amber-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-3 h-3" />
              <span>Login Portal</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="text-red-600 hover:text-red-700 font-semibold hover:underline flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Slide-Over Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
          onClick={onCloseMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Over Drawer Navigation (Responsive on phone and tablet) */}
      <aside
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Drawer"
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      >
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900">
                SmartStick <span className="text-amber-700 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 font-mono">ESP32</span>
              </span>
            </div>
            {onCloseMobileMenu && (
              <button
                onClick={onCloseMobileMenu}
                aria-label="Close navigation menu"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Hardware Status in Mobile Drawer */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${device?.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                {device?.isConnected ? 'Stick Connected' : 'Stick Offline'}
              </span>
              <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                {getBatteryIcon(device?.batteryLevel)}
                <span>{device?.batteryLevel ?? 84}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
              <span>GPS: <strong className="text-emerald-700">{device?.gpsStatus ?? 'ACTIVE'}</strong></span>
              <span>Wi-Fi: <strong className="text-slate-700">{device?.wifiStatus ?? 'ONLINE'}</strong></span>
            </div>
          </div>

          {/* Quick Accessibility Controls for Mobile */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setVoiceAnnouncements(!voiceAnnouncements)}
              className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                voiceAnnouncements
                  ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              {voiceAnnouncements ? <Volume2 className="w-3.5 h-3.5 text-amber-700" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span>{voiceAnnouncements ? 'Voice On' : 'Voice Off'}</span>
            </button>

            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                highContrast
                  ? 'bg-yellow-400 border-yellow-400 text-slate-950 font-bold'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{highContrast ? 'Contrast High' : 'Normal View'}</span>
            </button>
          </div>

          {/* Role Switcher in Mobile Drawer */}
          <button
            onClick={() => switchRoleDemo(user?.role === 'caregiver' ? 'user' : 'caregiver')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold hover:bg-cyan-100 transition"
          >
            <UserCheck className="w-4 h-4 text-cyan-700" />
            <span>Switch to {user?.role === 'caregiver' ? 'Ward / User Mode' : 'Caregiver Mode'}</span>
          </button>

          {/* All 11 Navigation Links in Mobile Drawer */}
          <nav className="space-y-1 pt-1" aria-label="Mobile Navigation Links">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                    isActive
                      ? 'bg-amber-50 text-amber-900 border border-amber-300 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span className="text-xs sm:text-sm">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {item.badge}
                    </span>
                  )}
                  {item.alert && (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Drawer Footer: User Snapshot & Logout */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 text-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center font-bold text-amber-700 shrink-0">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="overflow-hidden min-w-0 flex-1">
              <p className="font-semibold text-slate-800 truncate">{user?.name || 'SmartStick User'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTabClick('login')}
              className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-500" />
              <span>Login Portal</span>
            </button>

            <button
              type="button"
              id="mobile-drawer-logout-btn"
              onClick={() => {
                logout();
                if (onCloseMobileMenu) onCloseMobileMenu();
              }}
              className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Ultra-responsive on all phone sizes) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1.5 py-1.5 flex items-center justify-around shadow-lg">
        {/* 1. Dashboard */}
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-[11px] transition-colors min-h-[44px] ${
            currentTab === 'dashboard' ? 'text-amber-600 font-bold bg-amber-50/60' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="truncate max-w-[60px]">Dashboard</span>
        </button>

        {/* 2. Obstacle Radar */}
        <button
          onClick={() => handleTabClick('obstacle-radar')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-[11px] transition-colors min-h-[44px] ${
            currentTab === 'obstacle-radar' ? 'text-amber-600 font-bold bg-amber-50/60' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Radar className="w-5 h-5 mb-0.5" />
          <span className="truncate max-w-[60px]">Radar</span>
        </button>

        {/* 3. Live GPS Location */}
        <button
          onClick={() => handleTabClick('live-location')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-[11px] transition-colors min-h-[44px] ${
            currentTab === 'live-location' ? 'text-amber-600 font-bold bg-amber-50/60' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Navigation className="w-5 h-5 mb-0.5" />
          <span className="truncate max-w-[60px]">Location</span>
        </button>

        {/* 4. SOS Emergency History */}
        <button
          onClick={() => handleTabClick('emergency-history')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-[11px] transition-colors min-h-[44px] relative ${
            currentTab === 'emergency-history' ? 'text-amber-600 font-bold bg-amber-50/60' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className={`w-5 h-5 mb-0.5 ${activeEmergency ? 'text-red-600 animate-bounce' : ''}`} />
          <span className="truncate max-w-[60px]">{activeEmergency ? 'Active SOS' : 'Alerts'}</span>
          {activeEmergency && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-red-600 animate-ping" />
          )}
        </button>

        {/* 5. More / Slide-Over Menu Trigger */}
        <button
          onClick={onToggleMobileMenu}
          id="mobile-bottom-menu-btn"
          aria-label="Open full menu"
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-[11px] text-slate-600 hover:text-slate-900 transition-colors min-h-[44px]"
        >
          <Menu className="w-5 h-5 mb-0.5 text-slate-700" />
          <span>Menu</span>
        </button>
      </div>
    </>
  );
};
