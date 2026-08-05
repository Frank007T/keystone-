import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: 'dashboard' },
  { label: 'My Jobs', path: 'jobs' },
  { label: 'Time Log', path: 'time-log' },
  { label: 'Parts & Inventory', path: 'parts' },
  { label: 'My Schedule', path: 'schedule' },
  { label: 'Notifications', path: 'notifications' },
  { label: 'Profile', path: 'profile' },
];

export function TechnicianPortalLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen grid-cols-[260px_1fr] gap-6 px-6 py-6">
        <aside className="rounded-[32px] bg-slate-950 p-6 text-white shadow-soft">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">KEYSTONE</p>
            <h1 className="mt-4 text-2xl font-semibold">Technician Portal</h1>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-primary text-white' : 'text-slate-200 hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="rounded-[32px] bg-white p-6 shadow-soft">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
