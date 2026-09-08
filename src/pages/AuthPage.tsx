import React, { useState } from 'react';
import { Activity, Lock, Mail, User as UserIcon, Phone, Droplet, ArrowRight, ShieldCheck, Check, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, register, forgotPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('alex@smartstick.io');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Alex Johnson');
  const [phoneNumber, setPhoneNumber] = useState('+1 (555) 234-5678');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyMedicalInfo, setEmergencyMedicalInfo] = useState('Visually impaired (total blindness). Diabetic Type 1.');
  const [role, setRole] = useState<'user' | 'caregiver'>('user');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-white">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-xl mb-2">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Smart Blind Navigation Stick
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Secure emergency response & real-time sensor telemetry platform
          </p>
        </div>

        {/* Quick Demo Credentials Card */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-slate-300">Quick Demo Logins:</span>
            <span className="text-[10px] text-amber-400 font-mono">1-Click Sign-In</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickLogin('alex@smartstick.io', 'password123')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition"
            >
              <span className="font-bold text-white block">Blind User (Alex)</span>
              <span className="text-[10px] text-slate-400 truncate block">alex@smartstick.io</span>
            </button>
            <button
              type="button"
              onClick={() => quickLogin('sarah.caregiver@smartstick.io', 'caregiver123')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition"
            >
              <span className="font-bold text-white block">Caregiver (Sarah)</span>
              <span className="text-[10px] text-slate-400 truncate block">sarah@smartstick.io</span>
            </button>
          </div>
        </div>

        {/* Main Form Box */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
          
          <div className="flex border-b border-slate-800">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition ${
                mode === 'login' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition ${
                mode === 'signup' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {forgotMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              {forgotMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Alex Johnson"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('user')}
                      className={`py-2 rounded-xl text-xs font-bold border ${role === 'user' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                    >
                      Blind Stick User
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('caregiver')}
                      className={`py-2 rounded-xl text-xs font-bold border ${role === 'caregiver' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                    >
                      Caregiver / Guardian
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex@smartstick.io"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-amber-400 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Processing...' : mode === 'login' ? 'Log In to System' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs text-slate-400 hover:text-white"
              >
                Back to Login
              </button>
            )}

          </form>

        </div>

      </div>
    </div>
  );
};
