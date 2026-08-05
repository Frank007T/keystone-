import { NavLink, Outlet, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('keystoneToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

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

          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Logout
          </button>
        </aside>

        <main className="bg-slate-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
