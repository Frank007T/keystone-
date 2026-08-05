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
  { label: 'message',path: 'messages' },
  { label: 'Users', path: 'users' },
  { label: 'Settings', path: 'settings' },
  { label: 'Profile', path: 'profile' },
];

export function ManagerPortalLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-6">
          <div className="mb-10 flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center font-bold">K</div>
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
                    isActive ? 'bg-primary text-white shadow-soft' : 'text-slate-700 hover:bg-slate-100'
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
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Manager workspace</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">Operational command center</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-slate-800">
                Create Work Order
              </button>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">Alex Johnson • Manager</div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
