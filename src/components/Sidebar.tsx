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
  ShieldAlert
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
  | 'settings';

interface SidebarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user } = useAuth();
  const { activeEmergency } = useDevice();

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

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 p-4 justify-between shadow-xs">
        <div className="space-y-6">
          
          {/* Active Emergency Indicator in sidebar if active */}
          {activeEmergency && (
            <div
              onClick={() => onSelectTab('emergency-history')}
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
          <nav className="space-y-1" aria-label="Main Navigation">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
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

        {/* User Identity Snapshot in footer */}
        <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center font-bold text-amber-700">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-slate-800 truncate">{user?.name || 'SmartStick User'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-1 flex items-center justify-around overflow-x-auto shadow-sm">
        {navItems.slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-lg text-[10px] transition-colors ${
                isActive ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="truncate max-w-[64px]">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-lg text-[10px] transition-colors ${
            currentTab === 'settings' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </div>
    </>
  );
};
