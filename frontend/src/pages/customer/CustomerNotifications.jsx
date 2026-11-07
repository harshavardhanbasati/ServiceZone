import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TechButton } from '../../components/ui/TechButton';
import { Bell, Check, CheckCheck } from 'lucide-react';

export function CustomerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  return (
    <div className="bg-white border border-techgrey-300 p-6 sm:p-8 font-quantico space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-techgrey-300">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-electric">
            COMMUNICATION STREAM
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-graphite-900 mt-1">
            NOTIFICATIONS & UPDATES
          </h1>
        </div>

        <div className="text-xs text-techgrey-500 uppercase">
          {notifications.filter(n => !n.is_read).length} UNREAD NOTIFICATIONS
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs uppercase font-bold text-techgrey-500">
          LOADING UPDATES...
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-offwhite-50 border border-techgrey-300 p-12 text-center space-y-2">
          <Bell className="w-8 h-8 text-techgrey-400 mx-auto" />
          <div className="text-xs font-bold uppercase text-graphite-900">NO NOTIFICATIONS IN FEED</div>
          <p className="text-[11px] text-techgrey-500 uppercase">
            Status updates and appointment notifications will be dispatched here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 border text-xs uppercase flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                n.is_read
                  ? 'bg-white border-techgrey-200 text-techgrey-600'
                  : 'bg-electric/5 border-electric/40 text-graphite-900'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-electric">{n.title}</span>
                  <span className="text-[10px] text-techgrey-400">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="leading-relaxed">{n.message}</p>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="self-start sm:self-auto px-2.5 py-1 border border-techgrey-300 hover:border-graphite-900 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  MARK READ
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
