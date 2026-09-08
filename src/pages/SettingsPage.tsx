import React, { useState } from 'react';
import {
  Settings,
  Save,
  ShieldAlert,
  Volume2,
  Eye,
  MapPin,
  Bell,
  User as UserIcon,
  Check,
  Heart,
  Droplet,
  Phone,
  Mail,
  LogOut,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, logout, updateProfile, highContrast, setHighContrast, voiceAnnouncements, setVoiceAnnouncements } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'O+');
  const [address, setAddress] = useState(user?.address || '');
  const [emergencyMedicalInfo, setEmergencyMedicalInfo] = useState(user?.emergencyMedicalInfo || '');
  const [cancellationTimerSeconds, setCancellationTimerSeconds] = useState(user?.cancellationTimerSeconds ?? 20);
  const [trackingIntervalSeconds, setTrackingIntervalSeconds] = useState(user?.trackingIntervalSeconds ?? 5);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name,
        phoneNumber,
        email,
        bloodGroup,
        address,
        emergencyMedicalInfo,
        cancellationTimerSeconds,
        trackingIntervalSeconds,
        highContrastEnabled: highContrast,
        accessibilityVoiceEnabled: voiceAnnouncements,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">System Settings & Accessibility</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hardware countdown timers, GPS telemetry frequencies, and accessibility audio modes
              </p>
            </div>
          </div>

          {/* Direct Logout Button in Settings Header */}
          <button
            type="button"
            onClick={logout}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out Account</span>
          </button>
        </div>
      </div>

      {/* Account & Active Session Overview Card */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Authenticated User Session</h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
            Active
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center font-bold text-amber-800 text-base">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{user?.name || 'SmartStick User'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold uppercase">
                  {user?.role === 'caregiver' ? 'Caregiver' : 'Stick User'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            id="settings-logout-btn"
            onClick={logout}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-slate-200 hover:border-red-200 text-xs font-bold transition shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out / Log Out</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Preferences and user profile updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* 1. Emergency Behavior & Timers */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            Emergency Cancellation Window
          </h3>
          <p className="text-xs text-slate-500">
            When the physical emergency button on the smart stick is pushed, the system waits this number of seconds before dispatching SMS and SOS alerts to emergency contacts, allowing you to cancel false alarms.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[10, 20, 30].map(sec => (
              <button
                key={sec}
                type="button"
                onClick={() => setCancellationTimerSeconds(sec)}
                className={`p-4 rounded-xl border text-center transition ${
                  cancellationTimerSeconds === sec
                    ? 'bg-red-50 border-red-400 text-red-900 font-bold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="text-2xl font-black font-mono">{sec}s</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {sec === 10 ? 'Quick Dispatch' : sec === 20 ? 'Standard Window' : 'Extended Safety'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Tracking Interval */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            GPS Telemetry Upload Frequency
          </h3>
          <p className="text-xs text-slate-500">
            Interval at which the ESP32 pushes location points and ultrasonic sensor readings to the cloud server while live tracking is active.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[3, 5, 10].map(sec => (
              <button
                key={sec}
                type="button"
                onClick={() => setTrackingIntervalSeconds(sec)}
                className={`p-4 rounded-xl border text-center transition ${
                  trackingIntervalSeconds === sec
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="text-2xl font-black font-mono">{sec}s</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {sec === 3 ? 'High Precision (Higher Battery)' : sec === 5 ? 'Balanced (Recommended)' : 'Battery Saver'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Accessibility Modes */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-600" />
            Visual & Auditory Accessibility
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* High Contrast Toggle */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-xs block">High-Contrast Theme</span>
                <p className="text-[11px] text-slate-500">Amplified black-and-yellow contrast for low-vision users</p>
              </div>
              <button
                type="button"
                onClick={() => setHighContrast(!highContrast)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                  highContrast
                    ? 'bg-yellow-400 text-slate-950 border-yellow-500'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {highContrast ? 'Active' : 'Disabled'}
              </button>
            </div>

            {/* Voice Announcements Toggle */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-xs block">Spoken Voice Announcements</span>
                <p className="text-[11px] text-slate-500">Speaks critical obstacles and emergency countdowns aloud</p>
              </div>
              <button
                type="button"
                onClick={() => setVoiceAnnouncements(!voiceAnnouncements)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                  voiceAnnouncements
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {voiceAnnouncements ? 'Enabled' : 'Muted'}
              </button>
            </div>

          </div>
        </div>

        {/* 4. User Profile & Emergency Medical Information */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-indigo-600" />
            User Profile & Medical Emergency Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Residence Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Medical Notes (Sent to First Responders)</label>
              <textarea
                rows={3}
                value={emergencyMedicalInfo}
                onChange={e => setEmergencyMedicalInfo(e.target.value)}
                placeholder="e.g. Visually impaired. Diabetic Type 1. Needs insulin assistance."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition active:scale-95 cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
