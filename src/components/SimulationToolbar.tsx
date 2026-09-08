import React, { useState } from 'react';
import {
  Cpu,
  AlertTriangle,
  Navigation,
  Radar,
  BatteryLow,
  PowerOff,
  RotateCcw,
  Sparkles,
  Info,
  X
} from 'lucide-react';
import { useDevice } from '../context/DeviceContext';

interface SimulationToolbarProps {
  onClose?: () => void;
}

export const SimulationToolbar: React.FC<SimulationToolbarProps> = ({ onClose }) => {
  const {
    simulateEmergency,
    simulateGPS,
    simulateObstacle,
    simulateLowBattery,
    simulateDisconnect,
    resetSimulation
  } = useDevice();

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const runAction = async (name: string, fn: () => Promise<void>) => {
    setLoadingAction(name);
    try {
      await fn();
      setFeedback(`Triggered: ${name}`);
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-slate-800 shadow-sm relative backdrop-blur animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-indigo-950">ESP32 Hardware Simulation Laboratory</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                DEMO MODE
              </span>
            </div>
            <p className="text-xs text-indigo-900/70">
              Test all hardware events and emergency workflows without requiring physical Arduino/ESP32 hardware.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-indigo-100 text-indigo-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 5 Requested Simulation Action Buttons + Reset */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
        
        {/* 1. Simulate Emergency */}
        <button
          onClick={() => runAction('Emergency Button', simulateEmergency)}
          disabled={loadingAction !== null}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 transition active:scale-95 group text-center shadow-2xs"
        >
          <AlertTriangle className="w-5 h-5 text-red-600 mb-1 group-hover:scale-110 transition" />
          <span className="text-xs font-bold">Simulate Emergency</span>
          <span className="text-[10px] text-red-600/70">Push Button Press</span>
        </button>

        {/* 2. Simulate GPS Update */}
        <button
          onClick={() => runAction('GPS Update', simulateGPS)}
          disabled={loadingAction !== null}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 transition active:scale-95 group text-center shadow-2xs"
        >
          <Navigation className="w-5 h-5 text-blue-600 mb-1 group-hover:scale-110 transition" />
          <span className="text-xs font-bold">Simulate GPS</span>
          <span className="text-[10px] text-blue-600/70">Walk Along Route</span>
        </button>

        {/* 3. Simulate Obstacle */}
        <button
          onClick={() => runAction('Ultrasonic Obstacle', simulateObstacle)}
          disabled={loadingAction !== null}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 transition active:scale-95 group text-center shadow-2xs"
        >
          <Radar className="w-5 h-5 text-cyan-600 mb-1 group-hover:scale-110 transition" />
          <span className="text-xs font-bold">Simulate Obstacle</span>
          <span className="text-[10px] text-cyan-700/70">Close Object (&lt;30cm)</span>
        </button>

        {/* 4. Simulate Low Battery */}
        <button
          onClick={() => runAction('Low Battery', simulateLowBattery)}
          disabled={loadingAction !== null}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 transition active:scale-95 group text-center shadow-2xs"
        >
          <BatteryLow className="w-5 h-5 text-amber-600 mb-1 group-hover:scale-110 transition" />
          <span className="text-xs font-bold">Simulate Battery</span>
          <span className="text-[10px] text-amber-700/70">Drop to 14%</span>
        </button>

        {/* 5. Simulate Device Disconnect */}
        <button
          onClick={() => runAction('Disconnect', simulateDisconnect)}
          disabled={loadingAction !== null}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 transition active:scale-95 group text-center shadow-2xs"
        >
          <PowerOff className="w-5 h-5 text-purple-600 mb-1 group-hover:scale-110 transition" />
          <span className="text-xs font-bold">Simulate Disconnect</span>
          <span className="text-[10px] text-purple-700/70">Toggle Offline</span>
        </button>

        {/* 6. Reset Simulation */}
        <button
          onClick={() => runAction('Reset', resetSimulation)}
          disabled={loadingAction !== null}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition active:scale-95 group text-center shadow-2xs"
        >
          <RotateCcw className="w-5 h-5 text-slate-500 mb-1 group-hover:rotate-180 transition duration-500" />
          <span className="text-xs font-bold">Reset State</span>
          <span className="text-[10px] text-slate-500">Return to Safe</span>
        </button>

      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="mt-3 text-xs text-indigo-700 flex items-center gap-1.5 font-mono font-medium">
          <Info className="w-3.5 h-3.5 text-indigo-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Clarification Note */}
      <div className="mt-2.5 pt-2 border-t border-indigo-200 text-[11px] text-indigo-800/80 flex items-center justify-between">
        <span>* Simulated events generate clearly marked records (`SIM_`) without incurring external SMS/Email carrier costs.</span>
      </div>

    </div>
  );
};
