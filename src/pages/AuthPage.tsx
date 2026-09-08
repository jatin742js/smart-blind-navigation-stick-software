import React, { useState } from 'react';
import {
  Activity,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Droplet,
  ArrowRight,
  Check,
  Heart,
  LogOut,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Sun,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  onSuccess?: () => void;
  onNavigateDashboard?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onNavigateDashboard }) => {
  const {
    user,
    login,
    register,
    logout,
    forgotPassword,
    voiceAnnouncements,
    setVoiceAnnouncements,
    highContrast,
    setHighContrast
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('alex@smartstick.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('Alex Johnson');
  const [phoneNumber, setPhoneNumber] = useState('+1 (555) 234-5678');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyMedicalInfo, setEmergencyMedicalInfo] = useState('Visually impaired (total blindness). Diabetic Type 1.');
  const [role, setRole] = useState<'user' | 'caregiver'>('user');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  const [logoutNotice, setLogoutNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotMsg(null);
    setLogoutNotice(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        if (onSuccess) onSuccess();
      } else if (mode === 'signup') {
        await register({
          name,
          email,
          password,
          phoneNumber,
          role,
          bloodGroup,
          emergencyMedicalInfo,
        });
        if (onSuccess) onSuccess();
      } else if (mode === 'forgot') {
        const res = await forgotPassword(email);
        setForgotMsg(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setForgotMsg(null);
    setLogoutNotice(null);
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutFromPage = () => {
    logout();
    setLogoutNotice('You have been logged out of your Smart Stick account successfully.');
    setError(null);
    setForgotMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-900 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Accessibility Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>ESP32 Hardware Cloud Connected</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Voice Announcements Button */}
          <button
            type="button"
            onClick={() => setVoiceAnnouncements(!voiceAnnouncements)}
            title={voiceAnnouncements ? 'Mute Voice Announcements' : 'Enable Voice Announcements'}
            aria-label="Voice Announcements Toggle"
            className={`p-2 rounded-xl border text-xs font-semibold transition shadow-xs ${
              voiceAnnouncements
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {voiceAnnouncements ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* High Contrast Toggle */}
          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            title="Toggle High Contrast Mode"
            aria-label="High Contrast Toggle"
            className={`p-2 rounded-xl border text-xs font-semibold transition shadow-xs ${
              highContrast
                ? 'bg-yellow-400 border-yellow-500 text-slate-950'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-md space-y-5">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shadow-sm mb-1">
            <Activity className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Smart Blind Navigation Stick
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Secure Emergency Response & Real-Time Telemetry Portal
          </p>
        </div>

        {/* LOGOUT BUTTON & ACTIVE SESSION CARD IN LOGIN PAGE */}
        {user && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-amber-300 shadow-sm space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Currently Signed In
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 capitalize">
                {user.role === 'caregiver' ? 'Caregiver' : 'Stick User'}
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center font-bold text-amber-800 text-lg">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="font-bold text-sm text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>

            {/* Logout and Continue Buttons in Login Page */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                id="login-page-logout-button"
                onClick={handleLogoutFromPage}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold shadow-xs transition active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onNavigateDashboard) onNavigateDashboard();
                  else if (onSuccess) onSuccess();
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition active:scale-95"
              >
                <span>To Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-slate-500 text-center pt-1 border-t border-slate-100">
              Need to switch user? Click <strong>Log Out</strong> above or sign in with another account below.
            </div>
          </div>
        )}

        {/* Quick Demo Credentials Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs space-y-2.5">
          <div className="flex items-center justify-between text-slate-600">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Quick 1-Click Demo Login
            </span>
            <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono font-bold">
              Instant Access
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="quick-login-blind-user"
              onClick={() => quickLogin('alex@smartstick.io', 'password123')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition group shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 text-xs group-hover:text-amber-900">Blind User (Alex)</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-semibold">User</span>
              </div>
              <span className="text-[10px] text-slate-500 truncate block font-mono">alex@smartstick.io</span>
            </button>

            <button
              type="button"
              id="quick-login-caregiver"
              onClick={() => quickLogin('sarah.caregiver@smartstick.io', 'caregiver123')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-left transition group shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 text-xs group-hover:text-cyan-900">Caregiver (Sarah)</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-cyan-100 text-cyan-800 rounded font-semibold">Guardian</span>
              </div>
              <span className="text-[10px] text-slate-500 truncate block font-mono">sarah@smartstick.io</span>
            </button>
          </div>
        </div>

        {/* Main Form Box */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
          
          {/* Mode Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              id="tab-login"
              onClick={() => { setMode('login'); setError(null); setLogoutNotice(null); }}
              className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition ${
                mode === 'login'
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              id="tab-signup"
              onClick={() => { setMode('signup'); setError(null); setLogoutNotice(null); }}
              className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition ${
                mode === 'signup'
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Logout Notice Alert */}
          {logoutNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{logoutNotice}</span>
            </div>
          )}

          {/* Error Notice Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Forgot Password Notice Alert */}
          {forgotMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{forgotMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Alex Johnson"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    >
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                      <option value="A-">A-</option>
                      <option value="B-">B-</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('user')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                        role === 'user'
                          ? 'bg-amber-50 border-amber-400 text-amber-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Blind Stick User
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('caregiver')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                        role === 'caregiver'
                          ? 'bg-amber-50 border-amber-400 text-amber-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Caregiver / Guardian
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Medical Notes</label>
                  <textarea
                    rows={2}
                    value={emergencyMedicalInfo}
                    onChange={e => setEmergencyMedicalInfo(e.target.value)}
                    placeholder="e.g. Visually impaired, Type 1 Diabetic"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  id="auth-email-input"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex@smartstick.io"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-amber-700 hover:underline font-medium"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="auth-password-input"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              id="auth-submit-btn"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? 'Log In to SmartStick'
                      : mode === 'signup'
                      ? 'Create Account & Connect'
                      : 'Send Password Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs font-semibold text-slate-600 hover:text-slate-900 py-1"
              >
                Back to Login Form
              </button>
            )}

          </form>

          {/* Quick Clear Session / Force Logout Button in Card Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              256-bit Encrypted Token
            </span>
            <button
              type="button"
              onClick={handleLogoutFromPage}
              className="text-slate-500 hover:text-red-600 transition font-medium flex items-center gap-1"
              title="Clear all stored session data"
            >
              <LogOut className="w-3 h-3" />
              <span>Clear Session / Log Out</span>
            </button>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400">
          ESP32-WROOM-32 Hardware &bull; HC-SR04 Sonar &bull; NEO-6M GPS &bull; Cloud SOS
        </div>

      </div>
    </div>
  );
};
