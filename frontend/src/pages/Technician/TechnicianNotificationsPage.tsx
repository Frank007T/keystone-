import { useEffect, useState } from 'react';
import { fetchMyNotifications, Notification } from '../../lib/api';

export function TechnicianNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyNotifications()
      .then(setNotifications)
      .catch((err) => setError(err.message || 'Unable to load notifications.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Notifications</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Job alerts and updates</h2>
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-[24px] border border-slate-200 p-4 text-center text-slate-500">Loading notifications...</div>
          ) : error ? (
            <div className="rounded-[24px] border border-slate-200 p-4 text-center text-rose-600">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="rounded-[24px] border border-slate-200 p-4 text-center text-slate-500">No notifications found.</div>
          ) : (
            notifications.map((notification) => {
              const createdAtLabel = notification.createdAt ? new Date(notification.createdAt).toLocaleString() : '—';
              return (
                <div key={`${notification.title}-${notification.createdAt}`} className="rounded-[24px] border border-slate-200 p-4">
                  <p className="font-semibold text-slate-950">{notification.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{notification.message}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">{createdAtLabel}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
