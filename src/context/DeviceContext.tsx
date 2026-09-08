import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Device, SensorData, LocationPoint, EmergencyEvent } from '../types';
import { api } from '../api/client';
import { useAuth } from './AuthContext';
import { playAlarmCadence, playTone, speakAnnouncement } from '../utils/audio';

interface DeviceContextType {
  device: Device | null;
  sensor: SensorData | null;
  currentLocation: LocationPoint | null;
  locationTrail: LocationPoint[];
  activeEmergency: EmergencyEvent | null;
  countdownSeconds: number | null;
  isLiveTrackingActive: boolean;
  toggleLiveTracking: () => void;
  triggerEmergency: (triggerType?: string) => Promise<void>;
  cancelEmergency: (reason?: string) => Promise<void>;
  resolveEmergency: (eventId?: string) => Promise<void>;
  triggerBuzzer: () => Promise<void>;
  refreshTelemetry: () => Promise<void>;

  // Simulation controls
  simulateEmergency: () => Promise<void>;
  simulateGPS: () => Promise<void>;
  simulateObstacle: () => Promise<void>;
  simulateLowBattery: () => Promise<void>;
  simulateDisconnect: () => Promise<void>;
  resetSimulation: () => Promise<void>;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, voiceAnnouncements } = useAuth();
  const [device, setDevice] = useState<Device | null>(null);
  const [sensor, setSensor] = useState<SensorData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [locationTrail, setLocationTrail] = useState<LocationPoint[]>([]);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyEvent | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [isLiveTrackingActive, setIsLiveTrackingActive] = useState<boolean>(true);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer logic
  useEffect(() => {
    if (activeEmergency && activeEmergency.status === 'PENDING_CONFIRMATION') {
      const initialSeconds = activeEmergency.countdownRemainingSeconds || (user?.cancellationTimerSeconds ?? 20);
      setCountdownSeconds(initialSeconds);

      speakAnnouncement(`Emergency push button triggered. You have ${initialSeconds} seconds to cancel before alerts are dispatched.`, voiceAnnouncements);
      playAlarmCadence();

      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = setInterval(() => {
        setCountdownSeconds(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownIntervalRef.current!);
            return 0;
          }
          if (prev % 5 === 0 && prev > 0) {
            playTone(1000, 100);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setCountdownSeconds(null);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [activeEmergency?.id, activeEmergency?.status]);

  // Initial fetch of telemetry & locations
  const refreshTelemetry = async () => {
    try {
      const statusRes = await api.getDeviceStatus();
      if (statusRes.device) setDevice(statusRes.device);
      if (statusRes.sensor) setSensor(statusRes.sensor);
      if (statusRes.location) {
        setCurrentLocation(statusRes.location);
        setLocationTrail(prev => {
          if (!prev.some(p => p.id === statusRes.location?.id)) {
            return [...prev, statusRes.location!];
          }
          return prev;
        });
      }
      if (statusRes.activeEmergency) {
        setActiveEmergency(statusRes.activeEmergency);
      } else {
        setActiveEmergency(null);
      }

      // Also fetch location history for trail
      const locHistory = await api.getLocationHistory();
      if (locHistory && locHistory.length > 0) {
        setLocationTrail(locHistory.reverse());
        if (!currentLocation) {
          setCurrentLocation(locHistory[locHistory.length - 1]);
        }
      }
    } catch (err) {
      console.error('Error fetching initial telemetry:', err);
    }
  };

  useEffect(() => {
    refreshTelemetry();
  }, [user?.id]);

  // Connect to SSE stream for live hardware events
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/device/stream');

      eventSource.addEventListener('DEVICE_UPDATED', (e: MessageEvent) => {
        const payload = JSON.parse(e.data);
        if (payload.data) setDevice(payload.data);
      });

      eventSource.addEventListener('DEVICE_HEARTBEAT', (e: MessageEvent) => {
        const payload = JSON.parse(e.data);
        if (payload.data) setDevice(payload.data);
      });

      eventSource.addEventListener('SENSOR_UPDATED', (e: MessageEvent) => {
        const payload = JSON.parse(e.data);
        if (payload.data?.sensor) {
          setSensor(payload.data.sensor);
          // Audio feedback if critical obstacle
          if (payload.data.sensor.frontObstacle) {
            playTone(850, 100, 'square');
          }
        }
        if (payload.data?.device) {
          setDevice(payload.data.device);
        }
      });

      eventSource.addEventListener('LOCATION_UPDATED', (e: MessageEvent) => {
        const payload = JSON.parse(e.data);
        if (payload.data) {
          setCurrentLocation(payload.data);
          setLocationTrail(prev => [...prev.slice(-49), payload.data]);
        }
      });

      eventSource.addEventListener('EMERGENCY_PENDING', (e: MessageEvent) => {
        const payload = JSON.parse(e.data);
        if (payload.data) {
          setActiveEmergency(payload.data);
        }
      });

      eventSource.addEventListener('EMERGENCY_ACTIVATED', (e: MessageEvent) => {
        const payload = JSON.parse(e.data);
        if (payload.data) {
          setActiveEmergency(payload.data);
          speakAnnouncement('Emergency alert is now active! Emergency contacts have been notified.', voiceAnnouncements);
          playAlarmCadence();
        }
      });

      eventSource.addEventListener('EMERGENCY_CANCELLED', (e: MessageEvent) => {
        setActiveEmergency(null);
        setCountdownSeconds(null);
        speakAnnouncement('Emergency alert cancelled. All notifications stopped.', voiceAnnouncements);
      });

      eventSource.addEventListener('EMERGENCY_RESOLVED', () => {
        setActiveEmergency(null);
        setCountdownSeconds(null);
        speakAnnouncement('Emergency event resolved.', voiceAnnouncements);
      });

      eventSource.addEventListener('BUZZER_TRIGGERED', () => {
        playTone(1800, 400, 'sawtooth');
      });

      eventSource.onerror = () => {
        // SSE may reconnect automatically
      };
    } catch (err) {
      console.warn('Could not initialize SSE connection:', err);
    }

    // Polling fallback every 6 seconds if live tracking is enabled
    const interval = setInterval(() => {
      if (isLiveTrackingActive) {
        refreshTelemetry();
      }
    }, 6000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [isLiveTrackingActive, voiceAnnouncements]);

  const toggleLiveTracking = () => {
    setIsLiveTrackingActive(prev => {
      const nextVal = !prev;
      speakAnnouncement(`Live location tracking ${nextVal ? 'enabled' : 'disabled'}.`, voiceAnnouncements);
      return nextVal;
    });
  };

  const triggerEmergency = async (triggerType: string = 'MANUAL_APP') => {
    try {
      const res = await api.triggerEmergency({
        deviceId: device?.id || 'STICK_001',
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
        accuracy: currentLocation?.accuracyMeters,
        battery: device?.batteryLevel,
        triggerType,
      });
      setActiveEmergency(res);
    } catch (err) {
      console.error('Failed to trigger emergency:', err);
    }
  };

  const cancelEmergency = async (reason?: string) => {
    try {
      await api.cancelEmergency({ eventId: activeEmergency?.id, reason });
      setActiveEmergency(null);
      setCountdownSeconds(null);
    } catch (err) {
      console.error('Failed to cancel emergency:', err);
    }
  };

  const resolveEmergency = async (eventId?: string) => {
    try {
      await api.resolveEmergency(eventId || activeEmergency?.id);
      setActiveEmergency(null);
      setCountdownSeconds(null);
    } catch (err) {
      console.error('Failed to resolve emergency:', err);
    }
  };

  const triggerBuzzer = async () => {
    try {
      await api.triggerBuzzer({ deviceId: device?.id || 'STICK_001', durationMs: 2500 });
      speakAnnouncement('Sent sound alert command to smart stick.', voiceAnnouncements);
    } catch (err) {
      console.error('Failed to trigger stick buzzer:', err);
    }
  };

  // Simulations
  const simulateEmergency = async () => {
    try {
      const res = await api.simulateEmergency();
      setActiveEmergency(res.event);
    } catch (err) {
      console.error('Simulate emergency error:', err);
    }
  };

  const simulateGPS = async () => {
    try {
      const res = await api.simulateGPS();
      setCurrentLocation(res.location);
      setLocationTrail(prev => [...prev.slice(-49), res.location]);
      speakAnnouncement('GPS movement simulated.', voiceAnnouncements);
    } catch (err) {
      console.error('Simulate GPS error:', err);
    }
  };

  const simulateObstacle = async () => {
    try {
      const res = await api.simulateObstacle();
      setSensor(res.sensor);
      speakAnnouncement('Warning: Obstacle detected 28.5 centimeters ahead.', voiceAnnouncements);
    } catch (err) {
      console.error('Simulate obstacle error:', err);
    }
  };

  const simulateLowBattery = async () => {
    try {
      const res = await api.simulateLowBattery();
      setDevice(res.device);
      speakAnnouncement('Warning: Smart stick battery low at 14 percent.', voiceAnnouncements);
    } catch (err) {
      console.error('Simulate battery error:', err);
    }
  };

  const simulateDisconnect = async () => {
    try {
      const res = await api.simulateDisconnect();
      setDevice(res.device);
      speakAnnouncement(`Smart stick ${res.device.isConnected ? 'connected' : 'disconnected'}.`, voiceAnnouncements);
    } catch (err) {
      console.error('Simulate disconnect error:', err);
    }
  };

  const resetSimulation = async () => {
    try {
      await api.resetSimulation();
      setActiveEmergency(null);
      setCountdownSeconds(null);
      refreshTelemetry();
      speakAnnouncement('System simulation reset to safe operating parameters.', voiceAnnouncements);
    } catch (err) {
      console.error('Reset simulation error:', err);
    }
  };

  return (
    <DeviceContext.Provider
      value={{
        device,
        sensor,
        currentLocation,
        locationTrail,
        activeEmergency,
        countdownSeconds,
        isLiveTrackingActive,
        toggleLiveTracking,
        triggerEmergency,
        cancelEmergency,
        resolveEmergency,
        triggerBuzzer,
        refreshTelemetry,
        simulateEmergency,
        simulateGPS,
        simulateObstacle,
        simulateLowBattery,
        simulateDisconnect,
        resetSimulation,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) throw new Error('useDevice must be used within a DeviceProvider');
  return context;
};
