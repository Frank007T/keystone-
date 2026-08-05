export function TechnicianSchedulePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">My Schedule</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Today's schedule</h2>
        <div className="mt-6 space-y-4">
          {['09:00 AM - AC inspection', '11:00 AM - Pump maintenance', '02:00 PM - Electrical check'].map((slot) => (
            <div key={slot} className="rounded-[24px] border border-slate-200 p-4">
              <p className="font-semibold text-slate-950">{slot}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
