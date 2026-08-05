import { ShieldCheck, SlidersHorizontal, Users } from 'lucide-react';

export function AdminRolesPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Role management</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Role definitions & permissions</h2>
        <p className="mt-4 max-w-2xl text-slate-600">
          Manage role access levels across the platform. Use these controls to keep permissions aligned with your operational teams.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-primary">
            <ShieldCheck size={24} />
            <h3 className="text-lg font-semibold text-slate-950">Super Admin</h3>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Full system control, user and permissions management, approvals, and security configuration.
          </p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-indigo-600">
            <Users size={24} />
            <h3 className="text-lg font-semibold text-slate-950">Manager</h3>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Manage dispatchers, technicians, customers, and zone workflows while reviewing operational performance.
          </p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-600">
            <SlidersHorizontal size={24} />
            <h3 className="text-lg font-semibold text-slate-950">Dispatcher</h3>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Coordinate technicians, assign work orders, and maintain SLA compliance across customer sites.
          </p>
        </div>
      </div>
    </div>
  );
}
