import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  Wrench, 
  MapPin, 
  ClipboardList, 
  UserCheck, 
  FileText, 
  BarChart2, 
  Settings,
  Shield,
  ChevronLeft,
  Search,
  Bell
} from 'lucide-react';

const adminNavItems = [
  { label: 'Dashboard', path: 'dashboard', icon: LayoutDashboard },
  { label: 'Managers', path: 'managers', icon: Users },
  { label: 'Users', path: 'users', icon: UserCheck },
  { label: 'Requests', path: 'requests', icon: ClipboardList },
  { label: 'Roles', path: 'roles', icon: Shield },
  { label: 'Audit Logs', path: 'audit-logs', icon: FileText },
  { label: 'Reports', path: 'reports', icon: BarChart2 },
  { label: 'Settings', path: 'settings', icon: Settings },
];

export function AdminPortalLayout() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('keystoneToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="grid min-h-screen grid-cols-[260px_1fr]">
        
        {/* Dark Purple Sidebar */}
        <aside className="flex flex-col justify-between bg-[#2d2282] p-5 text-white">
          <div>
            {/* Logo Header */}
            <div className="mb-8 flex items-center justify-between border-b border-indigo-900/50 pb-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 font-bold text-white">
                  ⬢
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-wider text-white">KEYSTONE</h1>
                  <p className="text-[11px] text-indigo-300">Super Admin Portal</p>
                </div>
              </div>
              <button className="rounded-lg bg-indigo-900/40 p-1.5 text-indigo-200 hover:bg-indigo-900/80">
                <ChevronLeft size={16} />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="space-y-1.5">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? 'bg-[#635bff] text-white shadow-lg shadow-indigo-900/30'
                          : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* User Footer Profile */}
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-500 font-semibold text-white">
              SA
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">Super Admin</p>
              <p className="truncate text-xs text-indigo-300">superadmin@keystone.com</p>
            </div>
          </div>
        </aside>

        {/* Main Content View with Topbar Header */}
        <div className="flex flex-col">
          {/* Topbar */}
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
            <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
            
            <div className="flex items-center gap-6">
              {/* Search Bar */}
              <div className="relative w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white"
                />
              </div>

              {/* Notification Icon */}
              <button className="relative rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
                <Bell size={18} />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  3
                </span>
              </button>

              {/* Profile Avatar Header */}
              <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  SA
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Super Admin</p>
                  <p className="text-xs text-slate-400">superadmin@keystone.com</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </header>

          {/* Dynamic Page Outlet */}
          <main className="flex-1 bg-slate-50/50 p-8">
            <Outlet />
          </main>
        </div>

      </div>
    </div>
  );
}