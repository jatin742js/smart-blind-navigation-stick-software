import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, ExternalLink, ShieldCheck, Filter, Download, Info } from 'lucide-react';
import { api } from '../api/client';
import { LocationPoint } from '../types';
import { InteractiveMap } from '../components/InteractiveMap';

export const LocationHistoryPage: React.FC = () => {
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<LocationPoint | null>(null);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const history = await api.getLocationHistory();
        setLocations(history);
        if (history.length > 0) setSelectedPoint(history[0]);
      } catch (err) {
        console.error('Failed to load location history:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredLocations = dateFilter
    ? locations.filter(l => l.recordedAt.startsWith(dateFilter))
    : locations;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Location History</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical GPS waypoints recorded while live tracking was active
            </p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-slate-700 text-xs flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <span className="font-bold text-slate-900">Privacy Compliance:</span> Continuous location points are strictly stored only during active live tracking sessions authorized by the user or during emergency SOS broadcasts.
        </div>
      </div>

      {/* Map + Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Selected Point Map Preview (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
            <span>Waypoint Map View</span>
            {selectedPoint && (
              <span className="text-xs text-amber-600 font-mono font-semibold">
                {selectedPoint.latitude.toFixed(5)}, {selectedPoint.longitude.toFixed(5)}
              </span>
            )}
          </h3>

          <InteractiveMap
            currentLocation={selectedPoint}
            locationTrail={locations}
            isLiveTrackingActive={false}
            heightClass="h-[460px]"
          />
        </div>

        {/* Table of Points (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900">Logged GPS Points ({filteredLocations.length})</h3>
              <span className="text-xs text-slate-500">Select any point to preview on map</span>
            </div>

            {loading ? (
              <div className="p-6 text-center text-slate-400">Loading waypoints...</div>
            ) : filteredLocations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No GPS points recorded for this selection.</div>
            ) : (
              <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
                {filteredLocations.map((loc, idx) => {
                  const isSelected = selectedPoint?.id === loc.id;
                  return (
                    <div
                      key={loc.id || idx}
                      onClick={() => setSelectedPoint(loc)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-amber-50 border-amber-300 text-amber-900'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="font-mono text-slate-900">
                            {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                          </strong>
                          <span className="text-[10px] text-slate-500 font-mono">±{loc.accuracyMeters}m</span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {loc.speedKmh ? `${loc.speedKmh} km/h • ` : ''}Recorded via Neo-6M GPS
                        </p>
                      </div>

                      <div className="text-right font-mono text-[11px] text-slate-500">
                        <div>{new Date(loc.recordedAt).toLocaleTimeString()}</div>
                        <div className="text-[10px] text-slate-400">{new Date(loc.recordedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Points retention: 30 days</span>
            {selectedPoint && (
              <a
                href={`https://www.google.com/maps?q=${selectedPoint.latitude},${selectedPoint.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 font-semibold"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
