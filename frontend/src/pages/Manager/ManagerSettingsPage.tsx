export function ManagerSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Settings</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Portal configuration</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Company Profile</p>
            <p className="mt-4 text-sm text-slate-600">Update company name, address, and contact details.</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Security</p>
            <p className="mt-4 text-sm text-slate-600">Configure user roles, approvals, and access policies.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
