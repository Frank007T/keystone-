export function DispatcherReportsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Reports</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Field service insights</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-500">SLA Compliance</p>
            <p className="mt-4 text-4xl font-semibold text-slate-950">92%</p>
            <p className="mt-2 text-sm text-slate-500">Target &gt; 90%</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-500">Average Resolution Time</p>
            <p className="mt-4 text-4xl font-semibold text-slate-950">4.6 hrs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
