import React from 'react';
import { Radar, AlertCircle, CheckCircle2, Volume2, ShieldAlert } from 'lucide-react';
import { useDevice } from '../context/DeviceContext';

export const ObstacleRadar: React.FC = () => {
  const { sensor, device, triggerBuzzer } = useDevice();

  const front = sensor ? Math.round(sensor.frontDistanceCm) : 85;
  const left = sensor ? Math.round(sensor.leftDistanceCm) : 120;
  const right = sensor ? Math.round(sensor.rightDistanceCm) : 35;

  const getStatus = (dist: number) => {
    if (dist < 40) return { label: 'Danger', color: 'text-red-600', bg: 'bg-red-50 border-red-200', barBg: 'bg-red-500', isObstacle: true };
    if (dist < 70) return { label: 'Caution', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', barBg: 'bg-amber-500', isObstacle: true };
    return { label: 'Safe', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', barBg: 'bg-emerald-500', isObstacle: false };
  };

  const frontStatus = getStatus(front);
  const leftStatus = getStatus(left);
  const rightStatus = getStatus(right);

  const hasAnyObstacle = frontStatus.isObstacle || leftStatus.isObstacle || rightStatus.isObstacle;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
      
      {/* Header with Buzzer Sound Action */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600">
            <Radar className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Ultrasonic Obstacle Radar</h3>
            <p className="text-xs text-slate-500">3-Zone Real-Time Spatial Sensing (HC-SR04)</p>
          </div>
        </div>

        <button
          onClick={triggerBuzzer}
          title="Send audible test tone to smart stick"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 transition active:scale-95 shadow-2xs"
        >
          <Volume2 className="w-4 h-4 text-amber-600" />
          <span>Ping Buzzer</span>
        </button>
      </div>

      {/* Visual Spatial Diagram: Smart Stick Top-Down Radar */}
      <div className="relative py-6 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 mb-6">
        
        {/* Directional Arcs */}
        <div className="relative w-64 h-36 flex items-center justify-center">
          
          {/* Front Arc */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div
              className={`w-28 h-8 rounded-t-full border-t-4 transition-all duration-300 ${
                front < 40 ? 'border-red-500 bg-red-500/20 animate-pulse' : front < 70 ? 'border-amber-500 bg-amber-500/15' : 'border-emerald-500 bg-emerald-500/15'
              }`}
            />
            <span className={`text-[11px] font-mono font-bold mt-1 ${frontStatus.color}`}>
              Front: {front} cm
            </span>
          </div>

          {/* Left Arc */}
          <div className="absolute left-2 top-10 flex flex-col items-start">
            <div
              className={`w-12 h-20 rounded-l-full border-l-4 transition-all duration-300 ${
                left < 40 ? 'border-red-500 bg-red-500/20 animate-pulse' : left < 70 ? 'border-amber-500 bg-amber-500/15' : 'border-emerald-500 bg-emerald-500/15'
              }`}
            />
            <span className={`text-[11px] font-mono font-bold mt-1 ${leftStatus.color}`}>
              Left: {left} cm
            </span>
          </div>

          {/* Right Arc */}
          <div className="absolute right-2 top-10 flex flex-col items-end">
            <div
              className={`w-12 h-20 rounded-r-full border-r-4 transition-all duration-300 ${
                right < 40 ? 'border-red-500 bg-red-500/20 animate-pulse' : right < 70 ? 'border-amber-500 bg-amber-500/15' : 'border-emerald-500 bg-emerald-500/15'
              }`}
            />
            <span className={`text-[11px] font-mono font-bold mt-1 ${rightStatus.color}`}>
              Right: {right} cm
            </span>
          </div>

          {/* Center Stick Tip Marker */}
          <div className="relative mt-8 w-14 h-14 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center text-amber-600 font-bold shadow-md">
            🦯
          </div>

        </div>

        {/* Global Obstacle Status Alert Badge */}
        <div className="mt-4">
          {hasAnyObstacle ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold animate-pulse shadow-2xs">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Obstacle Alert: Immediate clearance needed</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pathway Clear: All directions safe</span>
            </div>
          )}
        </div>

      </div>

      {/* 3 Metric Cards for Front, Left, Right */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Front Sensor */}
        <div className={`p-4 rounded-xl border transition-colors shadow-2xs ${frontStatus.bg}`}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">Front Sensor</span>
            <span className={`font-bold ${frontStatus.color}`}>{frontStatus.label}</span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mb-2">
            {front} <span className="text-xs font-normal text-slate-500">cm</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${frontStatus.barBg}`}
              style={{ width: `${Math.min(100, (front / 200) * 100)}%` }}
            />
          </div>
        </div>

        {/* Left Sensor */}
        <div className={`p-4 rounded-xl border transition-colors shadow-2xs ${leftStatus.bg}`}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">Left Sensor</span>
            <span className={`font-bold ${leftStatus.color}`}>{leftStatus.label}</span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mb-2">
            {left} <span className="text-xs font-normal text-slate-500">cm</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${leftStatus.barBg}`}
              style={{ width: `${Math.min(100, (left / 200) * 100)}%` }}
            />
          </div>
        </div>

        {/* Right Sensor */}
        <div className={`p-4 rounded-xl border transition-colors shadow-2xs ${rightStatus.bg}`}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">Right Sensor</span>
            <span className={`font-bold ${rightStatus.color}`}>{rightStatus.label}</span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mb-2">
            {right} <span className="text-xs font-normal text-slate-500">cm</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${rightStatus.barBg}`}
              style={{ width: `${Math.min(100, (right / 200) * 100)}%` }}
            />
          </div>
        </div>

      </div>

    </div>
  );
};
