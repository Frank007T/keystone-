import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: 'dashboard' },
  { label: 'My Requests', path: 'requests' },
  { label: 'Raise Request', path: 'raise-request' },
  { label: 'My Sites', path: 'sites' },
  { label: 'Invoices', path: 'invoices' },
  { label: 'Notifications', path: 'notifications' },
  { label: 'Profile', path: 'profile' },
  { label: 'Help & Support', path: 'help' },
];

export function CustomerPortalLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen grid-cols-[260px_1fr] gap-6 px-6 py-6">
        <aside className="rounded-[32px] bg-slate-950 p-6 text-white shadow-soft">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">KEYSTONE</p>
            <h1 className="mt-4 text-2xl font-semibold">Customer Portal</h1>
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

          <div className="mt-10 rounded-[24px] border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Need help?</p>
            <p className="mt-3 text-sm text-slate-200">Contact support for customer service and maintenance updates.</p>
          </div>
        </aside>

        <main className="rounded-[32px] bg-white p-6 shadow-soft">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
