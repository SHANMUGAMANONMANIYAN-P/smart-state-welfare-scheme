import React, { useEffect, useState } from 'react';
import { notificationsAPI } from '../services/api';
import {
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Calendar,
  AlertCircle,
  RefreshCw,
  CheckCheck,
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsAPI.getAll();
      setNotifications(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const getBadge = (type) => {
    switch (type) {
      case 'scheme_update':
        return { label: 'Scheme Update', color: 'bg-brand-lavender text-brand-purple' };
      case 'eligibility_result':
        return { label: 'Eligibility Result', color: 'bg-emerald-100 text-emerald-800' };
      case 'deadline':
        return { label: 'Deadline Alert', color: 'bg-amber-100 text-amber-800' };
      default:
        return { label: 'System Notice', color: 'bg-slate-100 text-slate-700' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand-purple animate-spin mb-3" />
        <div className="text-xs font-bold text-slate-700">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center text-[11px] font-bold text-brand-purple uppercase tracking-wider mb-1">
            <Bell className="w-3.5 h-3.5 mr-1.5" />
            Welfare Broadcasts & Alerts
          </div>
          <h2 className="text-2xl font-black text-brand-navy tracking-tight">
            Notifications
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time updates regarding scheme application cycles, eligibility evaluations, and document deadlines.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-2xs"
        >
          <CheckCheck className="w-4 h-4 mr-1.5 text-brand-purple" />
          Mark All as Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filter === 'all'
              ? 'bg-brand-purple text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filter === 'unread'
              ? 'bg-brand-purple text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread ({notifications.filter((n) => !n.is_read).length})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filter === 'read'
              ? 'bg-brand-purple text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Read ({notifications.filter((n) => n.is_read).length})
        </button>
      </div>

      {/* Notification Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-sm text-slate-700">No Notifications</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You are all caught up with your welfare scheme updates.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const badge = getBadge(n.type);
            const dateStr = n.created_at
              ? new Date(n.created_at).toLocaleString()
              : 'Recent';

            return (
              <div
                key={n.id}
                className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  !n.is_read ? 'border-brand-purple/40 bg-brand-lavender/10' : ''
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${badge.color}`}>
                      {badge.label}
                    </span>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-brand-purple" />
                    )}
                    <span className="text-[11px] text-slate-400 font-medium">
                      {dateStr}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-brand-navy">
                    {n.title}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {!n.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-brand-purple hover:border-brand-purple/40 text-xs font-semibold shadow-2xs transition shrink-0"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
