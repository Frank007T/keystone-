export function DispatcherSlaPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">SLA Tracking</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Monitor service level agreements</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-500">Average SLA</p>
            <p className="mt-4 text-4xl font-semibold text-slate-950">92%</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-500">Overdue Work Orders</p>
            <p className="mt-4 text-4xl font-semibold text-slate-950">7</p>
          </div>
        </div>
      </div>
    </div>
  );
}
