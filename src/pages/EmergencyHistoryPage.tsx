import React, { useState, useEffect } from 'react';
import { History, ShieldAlert, CheckCircle, XCircle, AlertCircle, MapPin, ExternalLink, Users, Clock, Eye, Filter } from 'lucide-react';
import { api } from '../api/client';
import { EmergencyEvent, NotificationRecord } from '../types';

export const EmergencyHistoryPage: React.FC = () => {
  const [events, setEvents] = useState<EmergencyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<EmergencyEvent | null>(null);
  const [eventNotifications, setEventNotifications] = useState<NotificationRecord[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getEmergencyHistory(statusFilter === 'ALL' ? undefined : statusFilter);
      setEvents(data);
    } catch (err) {
      console.error('Error fetching emergency history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [statusFilter]);

  const openEventDetails = async (event: EmergencyEvent) => {
    setSelectedEvent(event);
    setLoadingNotifs(true);
    try {
      const notifs = await api.getNotifications(event.id);
      setEventNotifications(notifs);
    } catch (err) {
      console.error('Error fetching notifications for event:', err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">Active</span>;
      case 'PENDING_CONFIRMATION':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Countdown</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Resolved</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Emergency History</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive log of physical push button activations, coordinates, and dispatch statuses
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_CONFIRMATION">Pending Confirmation</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Table / Card List */}
      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading emergency history...</div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800">No Emergency Events Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            There are no recorded emergency events matching the current status filter.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Trigger / Event</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Contacts Notified</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map(ev => {
                  const hasGps = ev.latitude !== null && ev.longitude !== null;
                  return (
                    <tr
                      key={ev.id}
                      onClick={() => openEventDetails(ev)}
                      className="hover:bg-slate-50 cursor-pointer transition"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            ev.status === 'ACTIVE' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {ev.eventTrigger === 'PHYSICAL_BUTTON' ? 'Physical Stick Button' : ev.eventTrigger === 'SIMULATED' ? 'Simulated Emergency' : 'Manual App SOS'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">ID: {ev.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap font-mono text-slate-700">
                        {new Date(ev.createdAt).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate max-w-xs text-slate-800">{ev.locationAddress || 'Current GPS coordinates'}</span>
                        </div>
                        {hasGps && (
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            {ev.latitude?.toFixed(4)}, {ev.longitude?.toFixed(4)}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {getStatusBadge(ev.status)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-slate-700 bg-slate-100 font-mono text-xs border border-slate-200">
                          {ev.contactsNotifiedCount ?? 3} Contacts
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEventDetails(ev);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-600" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Inspection Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Emergency Event Inspection</h3>
                  <p className="text-xs font-mono text-slate-500">Event ID: {selectedEvent.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs">
              
              {/* Status and Trigger Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] block mb-1">Status</span>
                  {getStatusBadge(selectedEvent.status)}
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] block mb-1">Trigger</span>
                  <span className="font-bold text-slate-800">{selectedEvent.eventTrigger}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] block mb-1">Time Created</span>
                  <span className="font-mono text-slate-800">{new Date(selectedEvent.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] block mb-1">Date</span>
                  <span className="font-mono text-slate-800">{new Date(selectedEvent.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Cancellation Reason if cancelled */}
              {selectedEvent.status === 'CANCELLED' && (
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
                  <strong className="text-slate-900 block mb-0.5">Cancellation Details:</strong>
                  <p className="text-[11px]">Reason: {selectedEvent.cancellationReason || 'User pressed Cancel Emergency within countdown window'}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">Cancelled at: {new Date(selectedEvent.cancelledAt || selectedEvent.updatedAt).toLocaleTimeString()}</p>
                </div>
              )}

              {/* Location Details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    GPS Coordinates & Location
                  </span>
                  {selectedEvent.googleMapsUrl && (
                    <a
                      href={selectedEvent.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-700 font-semibold inline-flex items-center gap-1"
                    >
                      <span>Open in Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <p className="text-slate-700">{selectedEvent.locationAddress}</p>
                <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
                  <span>Lat: {selectedEvent.latitude?.toFixed(6) ?? 'N/A'}</span>
                  <span>Lng: {selectedEvent.longitude?.toFixed(6) ?? 'N/A'}</span>
                  <span>Accuracy: ±{selectedEvent.accuracyMeters ?? 4.5}m</span>
                </div>
              </div>

              {/* Notification Dispatch History */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Emergency Notifications Sent
                </h4>

                {loadingNotifs ? (
                  <div className="p-4 text-center text-slate-500">Loading notification audit log...</div>
                ) : eventNotifications.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-center">
                    No individual notification records stored for this event (or cancelled before dispatch).
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {eventNotifications.map(n => (
                      <div
                        key={n.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-900">{n.recipientName}</strong>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white text-slate-700 border border-slate-200">
                              {n.channel}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              n.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              {n.status}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] font-mono mt-0.5">{n.recipientDestination}</p>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">
                          {new Date(n.sentAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
