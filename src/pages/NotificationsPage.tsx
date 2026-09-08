import React, { useState, useEffect } from 'react';
import { Bell, Send, CheckCircle2, AlertTriangle, RefreshCw, MessageSquare, Mail, Smartphone, ExternalLink } from 'lucide-react';
import { api } from '../api/client';
import { NotificationRecord } from '../types';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    try {
      await api.retryNotification(id);
      await loadNotifications();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setRetryingId(null);
    }
  };

  const filtered = channelFilter === 'ALL'
    ? notifications
    : notifications.filter(n => n.channel === channelFilter);

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'SMS':
        return <Smartphone className="w-4 h-4 text-emerald-600" />;
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'PUSH':
        return <Bell className="w-4 h-4 text-purple-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Delivered</span>;
      case 'SENT':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">Sent</span>;
      case 'PENDING':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">Sending</span>;
      case 'FAILED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-800 border border-red-200">Failed</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Emergency Notification Dispatch Audit</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live delivery records across SMS, Email, and Push notification carriers
            </p>
          </div>
        </div>

        {/* Filters and Refresh */}
        <div className="flex items-center gap-2">
          <select
            value={channelFilter}
            onChange={e => setChannelFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Channels</option>
            <option value="SMS">SMS Gateway</option>
            <option value="EMAIL">Email SMTP</option>
            <option value="PUSH">Push Notifications</option>
          </select>

          <button
            onClick={loadNotifications}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            title="Refresh Notification Log"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Required Canonical Message Format Showcase Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            Standard Emergency Alert Format
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Dispatched to all active contacts</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-line leading-relaxed">
{`🚨 EMERGENCY ALERT
Alex Johnson may need immediate assistance.
Current Location:
https://www.google.com/maps?q=30.31650,78.03220
Time:
${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
Please contact the user immediately.`}
        </div>
      </div>

      {/* Notifications Table */}
      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading dispatch records...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm">
          <Bell className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800">No Notifications Found</h3>
          <p className="text-xs text-slate-500 mt-1">Notifications dispatched during emergency alerts will show up here.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Channel</th>
                  <th className="px-5 py-3.5">Recipient</th>
                  <th className="px-5 py-3.5">Destination / Provider</th>
                  <th className="px-5 py-3.5">Delivery Status</th>
                  <th className="px-5 py-3.5">Dispatched At</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(notif => (
                  <tr key={notif.id} className="hover:bg-slate-50/80 transition">
                    
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getChannelIcon(notif.channel)}
                        <span className="font-bold text-slate-900">{notif.channel}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <strong className="text-slate-900 block">{notif.recipientName}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">Ref: {notif.id}</span>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-slate-600">
                      <div>{notif.recipientDestination}</div>
                      {notif.providerRefId && (
                        <div className="text-[10px] text-slate-400">{notif.providerRefId}</div>
                      )}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getStatusBadge(notif.status)}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-slate-600">
                      {new Date(notif.sentAt).toLocaleTimeString()}
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {notif.status === 'FAILED' ? (
                        <button
                          onClick={() => handleRetry(notif.id)}
                          disabled={retryingId === notif.id}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] inline-flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${retryingId === notif.id ? 'animate-spin' : ''}`} />
                          <span>Retry</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Delivered</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
