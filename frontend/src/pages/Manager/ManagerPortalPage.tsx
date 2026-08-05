import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: 'dashboard' },
  { label: 'Work Orders', path: 'work-orders' },
  { label: 'Customers', path: 'customers' },
  { label: 'Sites', path: 'sites' },
  { label: 'Technicians', path: 'technicians' },
  { label: 'Dispatchers', path: 'dispatchers' },
  { label: 'Inventory', path: 'inventory' },
  { label: 'Reports', path: 'reports' },
  { label: 'Messages', path: 'messages' },
  { label: 'Users', path: 'users' },
  { label: 'Settings', path: 'settings' },
  { label: 'Profile', path: 'profile' },
];

export function ManagerPortalLayout() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const token = localStorage.getItem('token');

  // Fetch real notifications from the backend
  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/data/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Auto refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-6">
          <div className="mb-10 flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center font-bold">
              K
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">KEYSTONE</p>
              <h1 className="text-xl font-semibold text-slate-950">Manager Portal</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-primary text-white shadow-soft'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="bg-slate-100 p-6">
          <header className="mb-8 flex flex-col gap-4 rounded-[32px] bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Manager workspace
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                Operational command center
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Notification Button */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="relative grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition"
                  aria-label="Notifications"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>

                  {/* Notification Badge */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                      <h4 className="font-semibold text-slate-900 text-sm">Notifications</h4>
                      <span className="text-xs text-slate-400">{notifications.length} total</span>
                    </div>

                    <div className="max-h-64 space-y-2 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-center text-xs text-slate-400 py-4">
                          No new notifications
                        </p>
                      ) : (
                        notifications.slice(0, 5).map((item) => (
                          <div
                            key={item.id}
                            className="rounded-xl bg-slate-50 p-2.5 text-xs border border-slate-100 hover:bg-slate-100 transition"
                          >
                            <p className="font-bold text-slate-800">{item.title}</p>
                            <p className="text-slate-600 line-clamp-2 mt-0.5">{item.message}</p>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              From: {item.senderRole}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-slate-800">
                Create Work Order
              </button>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Alex Johnson • Manager
              </div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}