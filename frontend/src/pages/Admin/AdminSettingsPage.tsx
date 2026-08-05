import { SlidersHorizontal, ShieldCheck, Clock } from 'lucide-react';

export function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Platform settings</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Administration controls</h2>
        <p className="mt-4 max-w-2xl text-slate-600">
          Configure system defaults, security controls, and operational preferences for your Keystone workspace.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <ShieldCheck size={24} />
            <div>
              <h3 className="text-lg font-semibold">Security</h3>
              <p className="mt-2 text-sm text-slate-600">Manage password policies, role permissions, and session settings.</p>
            </div>
          </div>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <SlidersHorizontal size={24} />
            <div>
              <h3 className="text-lg font-semibold">Workflow</h3>
              <p className="mt-2 text-sm text-slate-600">Customize approval flows, notifications, and SLA thresholds.</p>
            </div>
          </div>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <Clock size={24} />
            <div>
              <h3 className="text-lg font-semibold">Audit</h3>
              <p className="mt-2 text-sm text-slate-600">Track system activity and review the most recent administrative events.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
