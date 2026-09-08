import React, { useState } from 'react';
import { Navigation, Play, Pause, Crosshair, ExternalLink, MapPin, Gauge, Compass, ShieldCheck, History, Clock } from 'lucide-react';
import { useDevice } from '../context/DeviceContext';
import { InteractiveMap } from '../components/InteractiveMap';

export const LiveLocationPage: React.FC = () => {
  const { currentLocation, locationTrail, isLiveTrackingActive, toggleLiveTracking, simulateGPS } = useDevice();
  const [showTrailList, setShowTrailList] = useState(false);

  const hasCoords = currentLocation && currentLocation.latitude !== null && currentLocation.longitude !== null;
  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`
    : 'https://www.google.com/maps';

  return (
    <div className="space-y-6">
      
      {/* Header with Live Tracking Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Navigation className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Live Location Tracking</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isLiveTrackingActive
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {isLiveTrackingActive ? '🟢 Live Sharing Active' : '⏸️ Sharing Paused'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuous GPS coordinate stream from the ESP32 Neo-6M module
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleLiveTracking}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              isLiveTrackingActive
                ? 'bg-slate-100 hover:bg-slate-200 text-amber-800 border border-slate-200'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isLiveTrackingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isLiveTrackingActive ? 'Pause Tracking' : 'Start Live Tracking'}</span>
          </button>

          <button
            onClick={() => simulateGPS()}
            className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold text-indigo-700 transition"
          >
            Simulate Step
          </button>
        </div>
      </div>

      {/* Main Full-Size Map View */}
      <div className="space-y-4">
        <InteractiveMap
          currentLocation={currentLocation}
          locationTrail={locationTrail}
          isLiveTrackingActive={isLiveTrackingActive}
          onToggleLiveTracking={toggleLiveTracking}
          heightClass="h-[520px]"
          zoomLevel={17}
        />
      </div>

      {/* GPS Telemetry Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Latitude & Longitude */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            Coordinates
          </span>
          {hasCoords ? (
            <p className="text-base font-bold font-mono text-slate-900">
              {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
            </p>
          ) : (
            <p className="text-xs text-amber-600 font-semibold">Unavailable</p>
          )}
        </div>

        {/* GPS Accuracy */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
            <Crosshair className="w-3.5 h-3.5 text-blue-600" />
            Horizontal Accuracy
          </span>
          <p className="text-base font-bold font-mono text-slate-900">
            ±{currentLocation?.accuracyMeters ?? 4.2} meters
          </p>
        </div>

        {/* Speed */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
            <Gauge className="w-3.5 h-3.5 text-emerald-600" />
            Walking Speed
          </span>
          <p className="text-base font-bold font-mono text-slate-900">
            {currentLocation?.speedKmh ?? 0} km/h
          </p>
        </div>

        {/* Last Timestamp */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            Last GPS Packet
          </span>
          <p className="text-base font-bold font-mono text-slate-900 truncate">
            {currentLocation ? new Date(currentLocation.recordedAt).toLocaleTimeString() : 'Awaiting sync...'}
          </p>
        </div>

      </div>

      {/* Breadcrumbs Trail Section */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Recent Waypoint Breadcrumbs ({locationTrail.length})</h3>
          </div>
          <button
            onClick={() => setShowTrailList(!showTrailList)}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
          >
            {showTrailList ? 'Hide Waypoints' : 'Show Waypoint Log'}
          </button>
        </div>

        {showTrailList && (
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {locationTrail.slice().reverse().map((pt, idx) => (
              <div
                key={pt.id || idx}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-mono text-[10px] text-slate-700">
                    {locationTrail.length - idx}
                  </span>
                  <span className="font-mono text-slate-800">
                    {pt.latitude?.toFixed(5)}, {pt.longitude?.toFixed(5)}
                  </span>
                  <span className="text-slate-500 text-[11px]">(±{pt.accuracyMeters}m)</span>
                </div>
                <span className="text-slate-500 text-[11px] font-mono">
                  {new Date(pt.recordedAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
