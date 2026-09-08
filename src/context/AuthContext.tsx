import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../api/client';
import { speakAnnouncement } from '../utils/audio';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  switchRoleDemo: (role: UserRole) => Promise<void>;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  voiceAnnouncements: boolean;
  setVoiceAnnouncements: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [voiceAnnouncements, setVoiceAnnouncements] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const profile = await api.getProfile();
        setUser(profile);
        if (profile.highContrastEnabled !== undefined) {
          setHighContrast(profile.highContrastEnabled);
        }
        if (profile.accessibilityVoiceEnabled !== undefined) {
          setVoiceAnnouncements(profile.accessibilityVoiceEnabled);
        }
      } catch (err) {
        console.warn('Could not load stored user session, will use demo user', err);
        // Fallback default user for immediate app usability
        setUser({
          id: 'usr_001',
          name: 'Alex Johnson',
          email: 'alex@smartstick.io',
          phoneNumber: '+1 (555) 234-5678',
          role: 'user',
          emergencyMedicalInfo: 'Visually impaired (total blindness). Diabetic Type 1.',
          bloodGroup: 'O+',
          address: '42 Pine Crest Avenue, Dehradun, UK 248001',
          accessibilityVoiceEnabled: true,
          highContrastEnabled: false,
          cancellationTimerSeconds: 20,
          trackingIntervalSeconds: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      speakAnnouncement(`Welcome back, ${res.user.name}. Smart stick system active.`, voiceAnnouncements);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      speakAnnouncement(`Account created. Welcome to Smart Blind Navigation Stick, ${res.user.name}.`, voiceAnnouncements);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
    speakAnnouncement('Logged out of Smart Stick system.', voiceAnnouncements);
  };

  const forgotPassword = async (email: string) => {
    return await api.forgotPassword(email);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = await api.updateProfile(updates);
    setUser(updated);
    if (updates.highContrastEnabled !== undefined) setHighContrast(updates.highContrastEnabled);
    if (updates.accessibilityVoiceEnabled !== undefined) setVoiceAnnouncements(updates.accessibilityVoiceEnabled);
  };

  const switchRoleDemo = async (role: UserRole) => {
    if (role === 'caregiver') {
      await login('sarah.caregiver@smartstick.io', 'caregiver123');
    } else {
      await login('alex@smartstick.io', 'password123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
        updateProfile,
        switchRoleDemo,
        highContrast,
        setHighContrast,
        voiceAnnouncements,
        setVoiceAnnouncements,
      }}
    >
      <div className={highContrast ? 'high-contrast-mode' : ''}>
        {children}
      </div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
