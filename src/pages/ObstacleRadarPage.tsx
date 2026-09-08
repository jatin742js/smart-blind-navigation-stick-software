import React, { useState } from 'react';
import { Radar, Volume2, ShieldCheck, AlertTriangle, Cpu, Radio, Sparkles, RefreshCw } from 'lucide-react';
import { useDevice } from '../context/DeviceContext';
import { ObstacleRadar } from '../components/ObstacleRadar';

export const ObstacleRadarPage: React.FC = () => {
  const { sensor, device, triggerBuzzer, simulateObstacle } = useDevice();
  const [safetyThreshold, setSafetyThreshold] = useState(50); // cm

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
            <Radar className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Ultrasonic Obstacle Detection</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Triple HC-SR04 sonar array providing 180° frontal spatial navigation protection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerBuzzer()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-amber-800 border border-slate-200 text-xs font-semibold shadow-sm transition"
          >
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span>Test Haptic Buzzer</span>
          </button>

          <button
            onClick={() => simulateObstacle()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold transition"
          >
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span>Simulate Obstacle</span>
          </button>
        </div>
      </div>

      {/* Main Visual Radar Display */}
      <ObstacleRadar />

      {/* Technical Sensor Diagnostics & Thresholds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Hardware Mapping & Pins */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-cyan-600" />
            ESP32 Ultrasonic Pinout Allocation
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <strong className="text-slate-900">Front Sonar (Center Path)</strong>
                <p className="text-slate-500 text-[11px]">Primary obstacle detection directly ahead</p>
              </div>
              <div className="text-right font-mono text-[11px] text-cyan-700 font-semibold">
                <span>TRIG: GPIO 5</span><br />
                <span>ECHO: GPIO 19</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <strong className="text-slate-900">Left Sonar (Left Flank)</strong>
                <p className="text-slate-500 text-[11px]">Detects walls, pillars, and flanking pedestrians</p>
              </div>
              <div className="text-right font-mono text-[11px] text-cyan-700 font-semibold">
                <span>TRIG: GPIO 18</span><br />
                <span>ECHO: GPIO 21</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <strong className="text-slate-900">Right Sonar (Right Flank)</strong>
                <p className="text-slate-500 text-[11px]">Detects curbs, vehicles, and barriers</p>
              </div>
              <div className="text-right font-mono text-[11px] text-cyan-700 font-semibold">
                <span>TRIG: GPIO 22</span><br />
                <span>ECHO: GPIO 23</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sonar Sensitivity Configuration */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-2">
              <Radio className="w-4 h-4 text-amber-500" />
              Stick Proximity Alarm Threshold
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Configures the distance at which the smart stick’s piezoelectric buzzer and haptic vibration trigger continuous beeps to warn the user.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Audible Alert Distance</span>
                  <span className="font-mono text-amber-600 font-bold text-sm">{safetyThreshold} cm</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="150"
                  step="5"
                  value={safetyThreshold}
                  onChange={e => setSafetyThreshold(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>20 cm (Close quarters)</span>
                  <span>150 cm (Long range)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-900 block">Current Sensor Telemetry:</span>
                <p className="text-[11px] text-slate-500">
                  Front: <strong className="text-slate-800">{sensor?.frontDistanceCm ?? 85}cm</strong> |
                  Left: <strong className="text-slate-800">{sensor?.leftDistanceCm ?? 120}cm</strong> |
                  Right: <strong className="text-slate-800">{sensor?.rightDistanceCm ?? 35}cm</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            * Threshold changes are pushed to ESP32 over REST endpoint <code className="text-amber-700 font-mono">/api/device/config</code>
          </div>
        </div>

      </div>

    </div>
  );
};
