export function ManagerReportsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Reports</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Operational insights</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-500">SLA Compliance</p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-4xl font-semibold text-slate-950">92%</p>
                <p className="text-sm text-slate-500">Target &gt; 90%</p>
              </div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">On Track</div>
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-500">Average Repair Time</p>
            <div className="mt-4 text-4xl font-semibold text-slate-950">4.6 hrs</div>
          </div>
        </div>
      </div>
    </div>
  );
}
