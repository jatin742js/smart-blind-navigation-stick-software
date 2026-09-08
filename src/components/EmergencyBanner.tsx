import React, { useState } from 'react';
import { ShieldAlert, XCircle, CheckCircle, ExternalLink, Clock, MapPin, Send, AlertOctagon } from 'lucide-react';
import { useDevice } from '../context/DeviceContext';
import { useAuth } from '../context/AuthContext';

export const EmergencyBanner: React.FC = () => {
  const { activeEmergency, countdownSeconds, cancelEmergency, resolveEmergency, currentLocation } = useDevice();
  const { user } = useAuth();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('False alarm / Test');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  if (!activeEmergency) return null;

  const isPending = activeEmergency.status === 'PENDING_CONFIRMATION';
  const hasGps = activeEmergency.latitude !== null && activeEmergency.longitude !== null;
  const mapsUrl = activeEmergency.googleMapsUrl || (hasGps ? `https://www.google.com/maps?q=${activeEmergency.latitude},${activeEmergency.longitude}` : '#');

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelEmergency(cancelReason);
      setShowCancelPrompt(false);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="mb-6 rounded-2xl bg-gradient-to-r from-red-950/90 via-red-900/90 to-rose-950/90 border-2 border-red-500 text-white p-5 sm:p-6 shadow-2xl shadow-red-950/60 transition-all animate-fadeIn"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Side: Status and Countdown */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-600/30 border border-red-500/50 flex items-center justify-center shrink-0 text-red-400">
            <AlertOctagon className="w-8 h-8 animate-pulse text-red-400" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider uppercase bg-red-500 text-white shadow-sm">
                {isPending ? 'EMERGENCY INITIATED' : 'EMERGENCY ACTIVE'}
              </span>
              <span className="text-xs text-red-200 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                {new Date(activeEmergency.createdAt).toLocaleTimeString()}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {isPending
                ? `Emergency Alert Activated — Auto-Dispatch in ${countdownSeconds ?? 0}s`
                : `🚨 Emergency Alert In Progress — Contacts Notified`}
            </h2>

            <p className="text-sm text-red-200/90 max-w-2xl">
              {isPending
                ? `The physical smart stick emergency button was triggered. Press "Cancel Emergency" immediately if this is a false alarm.`
                : `Automated emergency notifications have been transmitted with coordinates to registered emergency contacts.`}
            </p>

            {/* GPS Location status readout */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-red-950/70 border border-red-800/80 px-2.5 py-1 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                {hasGps ? (
                  <span>
                    Lat: <strong>{activeEmergency.latitude?.toFixed(4)}</strong>, Lng: <strong>{activeEmergency.longitude?.toFixed(4)}</strong>
                  </span>
                ) : (
                  <span className="text-amber-300 font-semibold">
                    GPS location unavailable. Showing last known location.
                  </span>
                )}
              </div>

              {hasGps && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Location on Google Maps
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Primary Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          
          {/* Cancel Emergency Button */}
          {isPending ? (
            !showCancelPrompt ? (
              <button
                onClick={() => setShowCancelPrompt(true)}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-red-950 font-black text-base shadow-xl hover:shadow-2xl transition active:scale-95 flex items-center justify-center gap-2 focus:ring-4 focus:ring-white/40"
              >
                <XCircle className="w-5 h-5 text-red-600" />
                <span>CANCEL EMERGENCY</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-950/80 p-2 rounded-xl border border-red-700">
                <input
                  type="text"
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="Reason for cancellation"
                  className="text-xs bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold whitespace-nowrap"
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
                <button
                  onClick={() => setShowCancelPrompt(false)}
                  className="p-2 text-slate-400 hover:text-white text-xs"
                >
                  Dismiss
                </button>
              </div>
            )
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => resolveEmergency()}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Mark as Resolved</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
