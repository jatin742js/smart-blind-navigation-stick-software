import React, { useState } from 'react';
import { Settings, Save, ShieldAlert, Volume2, Eye, MapPin, Bell, User as UserIcon, Check, Heart, Droplet, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, highContrast, setHighContrast, voiceAnnouncements, setVoiceAnnouncements } = useAuth();

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
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">System Settings & Accessibility Preferences</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize countdown timers, hardware tracking intervals, and accessibility speech modes
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Preferences and user profile updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* 1. Emergency Behavior & Timers */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            Emergency Cancellation Window
          </h3>
          <p className="text-xs text-slate-400">
            When the physical emergency button on the smart stick is pushed, the system waits this number of seconds before dispatching alerts to emergency contacts, allowing you to cancel false alarms.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[10, 20, 30].map(sec => (
              <button
                key={sec}
                type="button"
                onClick={() => setCancellationTimerSeconds(sec)}
                className={`p-4 rounded-xl border text-center transition ${
                  cancellationTimerSeconds === sec
                    ? 'bg-red-600/20 border-red-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-2xl font-black font-mono">{sec}s</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {sec === 10 ? 'Quick Dispatch' : sec === 20 ? 'Standard Window' : 'Extended Safety'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Tracking Interval */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            GPS Telemetry Upload Frequency
          </h3>
          <p className="text-xs text-slate-400">
            Interval at which the ESP32 pushes location points and ultrasonic sensor readings to the server while live tracking is enabled.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[3, 5, 10].map(sec => (
              <button
                key={sec}
                type="button"
                onClick={() => setTrackingIntervalSeconds(sec)}
                className={`p-4 rounded-xl border text-center transition ${
                  trackingIntervalSeconds === sec
                    ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-2xl font-black font-mono">{sec}s</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {sec === 3 ? 'High Precision (Higher Battery)' : sec === 5 ? 'Balanced (Recommended)' : 'Battery Saver'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Accessibility Modes */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-400" />
            Visual & Auditory Accessibility
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* High Contrast Toggle */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-xs block">High-Contrast Theme</span>
                <p className="text-[11px] text-slate-400">Amplified black-and-yellow contrast for low-vision users</p>
              </div>
              <button
                type="button"
                onClick={() => setHighContrast(!highContrast)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                  highContrast
                    ? 'bg-yellow-400 text-slate-950 border-yellow-300'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {highContrast ? 'Active' : 'Disabled'}
              </button>
            </div>

            {/* Voice Announcements Toggle */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-xs block">Spoken Voice Announcements</span>
                <p className="text-[11px] text-slate-400">Speaks critical obstacles and emergency countdowns aloud</p>
              </div>
              <button
                type="button"
                onClick={() => setVoiceAnnouncements(!voiceAnnouncements)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                  voiceAnnouncements
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {voiceAnnouncements ? 'Enabled' : 'Muted'}
              </button>
            </div>

          </div>
        </div>

        {/* 4. User Profile & Emergency Medical Information */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-cyan-400" />
            User Profile & Medical Emergency Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Residence Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Medical Notes (Sent to First Responders)</label>
              <textarea
                rows={3}
                value={emergencyMedicalInfo}
                onChange={e => setEmergencyMedicalInfo(e.target.value)}
                placeholder="e.g. Visually impaired. Diabetic Type 1. Needs insulin assistance."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
