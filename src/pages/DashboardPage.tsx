import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Phone,
  Mail,
  Heart,
  Droplet,
  MapPin,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Users,
  Plus,
  ArrowRight,
  ExternalLink,
  Cpu,
  Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';
import { InteractiveMap } from '../components/InteractiveMap';
import { DeviceHealthCard } from '../components/DeviceHealthCard';
import { ObstacleRadar } from '../components/ObstacleRadar';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { api } from '../api/client';
import { EmergencyContact, EmergencyEvent } from '../types';
import { TabId } from '../components/Sidebar';

interface DashboardPageProps {
  onNavigate: (tab: TabId) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { device, currentLocation, locationTrail, isLiveTrackingActive, toggleLiveTracking, activeEmergency } = useDevice();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [recentEvents, setRecentEvents] = useState<EmergencyEvent[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [cList, hList] = await Promise.all([
          api.getContacts(),
          api.getEmergencyHistory(),
        ]);
        setContacts(cList.slice(0, 3));
        setRecentEvents(hList.slice(0, 4));
      } catch (err) {
        console.warn('Dashboard data fetch error:', err);
      }
    }
    loadData();
  }, [activeEmergency?.id]);

  return (
    <div className="space-y-6">
      
      {/* 1. Large Emergency Status Alert Banner (Shown during active or countdown emergency) */}
      <EmergencyBanner />

      {/* 2. Top Overview Grid: User Card & Quick Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Card */}
        <div className="lg:col-span-1 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold text-xl overflow-hidden shadow-2xs">
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name.charAt(0) : 'U'
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    {user?.name || 'Alex Johnson'}
                  </h3>
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    SmartStick Owner
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('settings')}
                className="text-xs text-slate-500 hover:text-amber-600 transition"
              >
                Edit Profile
              </button>
            </div>

            {/* Profile Attributes */}
            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono text-slate-800">{user?.phoneNumber || '+1 (555) 234-5678'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate text-slate-800">{user?.email || 'alex@smartstick.io'}</span>
              </div>
              {user?.bloodGroup && (
                <div className="flex items-center gap-2">
                  <Droplet className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>Blood Group: <strong className="text-slate-900 font-mono">{user.bloodGroup}</strong></span>
                </div>
              )}
              {user?.emergencyMedicalInfo && (
                <div className="flex items-start gap-2 pt-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-slate-600 text-[11px] leading-relaxed">
                    {user.emergencyMedicalInfo}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stick Device Status Pill */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Assigned Stick:</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${device?.isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <strong className="text-slate-800">{device?.deviceName || 'ESP32 Smart Stick'}</strong>
            </div>
          </div>
        </div>

        {/* Device Health Summary */}
        <div className="lg:col-span-2">
          <DeviceHealthCard />
        </div>

      </div>

      {/* 3. Main Interactive Map & Obstacle Radar Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Current Location Interactive Map (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-amber-600" />
              <span>Current Smart Stick Location</span>
            </h3>
            <button
              onClick={() => onNavigate('live-location')}
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 transition"
            >
              <span>Full Screen Track</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <InteractiveMap
            currentLocation={currentLocation}
            locationTrail={locationTrail}
            isLiveTrackingActive={isLiveTrackingActive}
            onToggleLiveTracking={toggleLiveTracking}
            heightClass="h-[380px]"
          />
        </div>

        {/* Ultrasonic Obstacle Radar (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-600" />
              <span>Obstacle Sensing</span>
            </h3>
            <button
              onClick={() => onNavigate('obstacle-radar')}
              className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-1 transition"
            >
              <span>Detailed Radar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ObstacleRadar />
        </div>

      </div>

      {/* 4. Bottom Row: Emergency Contacts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Emergency Contacts Card */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Emergency Contacts</h3>
                <p className="text-xs text-slate-500">Selected recipients for SOS notifications</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('emergency-contacts')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Contact</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {contacts.map(c => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 text-sm">{c.contactName}</strong>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {c.priority}
                    </span>
                    {c.isAuthorizedCaregiver && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Caregiver
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">{c.relationship} • {c.phoneNumber}</p>
                </div>

                <span className="text-[11px] font-mono text-slate-600 px-2 py-1 bg-white rounded border border-slate-200">
                  {c.notificationPreference}
                </span>
              </div>
            ))}

            <button
              onClick={() => onNavigate('emergency-contacts')}
              className="w-full py-2 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-900 text-xs font-semibold transition"
            >
              View All Emergency Contacts ({contacts.length})
            </button>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Recent Emergency & Stick Activity</h3>
                <p className="text-xs text-slate-500">Live timeline of device and SOS events</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('emergency-history')}
              className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
            >
              Full History
            </button>
          </div>

          <div className="space-y-3">
            {recentEvents.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recent emergency events recorded.</p>
            ) : (
              recentEvents.map(ev => {
                const isAlert = ev.status === 'ACTIVE' || ev.status === 'PENDING_CONFIRMATION';
                return (
                  <div
                    key={ev.id}
                    onClick={() => onNavigate('emergency-history')}
                    className="cursor-pointer p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAlert ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-800">
                            {ev.eventTrigger === 'SIMULATED' ? 'Simulated Emergency' : 'Push Button Emergency'}
                          </strong>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            ev.status === 'ACTIVE' ? 'bg-red-600 text-white' : ev.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {ev.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">
                          {ev.locationAddress || 'Central Clock Tower, Dehradun'}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                      {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
