import {
  User,
  Device,
  SensorData,
  LocationPoint,
  EmergencyContact,
  EmergencyEvent,
  NotificationRecord,
  CaregiverPermission
} from '../types';

const TOKEN_KEY = 'smartstick_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP error ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: any) => request<{ token: string; user: User }>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: any) => request<{ token: string; user: User }>('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  forgotPassword: (email: string) => request<{ success: boolean; message: string }>('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  getProfile: () => request<User>('/api/users/profile'),
  updateProfile: (profile: Partial<User>) => request<User>('/api/users/profile', { method: 'PUT', body: JSON.stringify(profile) }),

  // Contacts
  getContacts: () => request<EmergencyContact[]>('/api/contacts'),
  createContact: (contact: Partial<EmergencyContact>) => request<EmergencyContact>('/api/contacts', { method: 'POST', body: JSON.stringify(contact) }),
  updateContact: (id: string, contact: Partial<EmergencyContact>) => request<EmergencyContact>(`/api/contacts/${id}`, { method: 'PUT', body: JSON.stringify(contact) }),
  deleteContact: (id: string) => request<{ success: boolean }>(`/api/contacts/${id}`, { method: 'DELETE' }),

  // Device
  getDeviceStatus: () => request<{ device: Device; sensor: SensorData; location: LocationPoint | null; activeEmergency: EmergencyEvent | null }>('/api/device/status'),
  recordLocation: (payload: any) => request<LocationPoint>('/api/device/location', { method: 'POST', body: JSON.stringify(payload) }),
  recordSensorData: (payload: any) => request<SensorData>('/api/device/sensor-data', { method: 'POST', body: JSON.stringify(payload) }),
  triggerEmergency: (payload: any = {}) => request<EmergencyEvent>('/api/device/emergency', { method: 'POST', body: JSON.stringify(payload) }),
  cancelEmergency: (payload: { eventId?: string; reason?: string } = {}) => request<{ success: boolean; event: EmergencyEvent }>('/api/device/emergency/cancel', { method: 'POST', body: JSON.stringify(payload) }),
  resolveEmergency: (eventId?: string) => request<EmergencyEvent>('/api/device/emergency/resolve', { method: 'POST', body: JSON.stringify({ eventId }) }),
  triggerBuzzer: (payload: { deviceId?: string; durationMs?: number; frequencyHz?: number } = {}) => request<{ success: boolean; message: string }>('/api/device/buzzer-command', { method: 'POST', body: JSON.stringify(payload) }),

  // History & Notifications
  getEmergencyHistory: (status?: string) => request<EmergencyEvent[]>(status ? `/api/emergency/history?status=${status}` : '/api/emergency/history'),
  getActiveEmergency: () => request<{ activeEmergency: EmergencyEvent | null }>('/api/emergency/active'),
  getLocationHistory: (date?: string) => request<LocationPoint[]>(date ? `/api/location/history?date=${date}` : '/api/location/history'),
  getNotifications: (eventId?: string) => request<NotificationRecord[]>(eventId ? `/api/notifications?eventId=${eventId}` : '/api/notifications'),
  sendNotification: (payload: any) => request<NotificationRecord>('/api/notifications/send', { method: 'POST', body: JSON.stringify(payload) }),
  retryNotification: (id: string) => request<{ success: boolean; notification: NotificationRecord }>(`/api/notifications/${id}/retry`, { method: 'POST' }),

  // Caregiver
  getCaregiverPatients: () => request<{ permission: CaregiverPermission; patient: any; device: Device | null; lastLocation: LocationPoint | null; activeEmergency: EmergencyEvent | null }[]>('/api/caregiver/patients'),

  // Simulation
  simulateEmergency: () => request<{ success: boolean; message: string; event: EmergencyEvent }>('/api/demo/simulate-emergency', { method: 'POST' }),
  simulateGPS: () => request<{ success: boolean; location: LocationPoint }>('/api/demo/simulate-gps', { method: 'POST' }),
  simulateObstacle: () => request<{ success: boolean; message: string; sensor: SensorData }>('/api/demo/simulate-obstacle', { method: 'POST' }),
  simulateLowBattery: () => request<{ success: boolean; message: string; device: Device }>('/api/demo/simulate-battery', { method: 'POST' }),
  simulateDisconnect: () => request<{ success: boolean; message: string; device: Device }>('/api/demo/simulate-disconnect', { method: 'POST' }),
  resetSimulation: () => request<{ success: boolean; message: string }>('/api/demo/reset', { method: 'POST' }),

  // System & MongoDB status
  getDatabaseStatus: () => request<{ engine: string; status: { isConnected: boolean; uri: string; dbName: string; host?: string; error?: string } }>('/api/system/db-status'),
};
