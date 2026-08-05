export function DispatcherSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Settings</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Dispatcher settings</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-950">Notifications</p>
            <p className="mt-4 text-sm text-slate-700">Toggle alerts for work orders and SLA breaches.</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-950">Account</p>
            <p className="mt-4 text-sm text-slate-700">Update dispatcher profile details and preferences.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
