export function TechnicianProfilePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Profile</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Mike Brown</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Personal Details</p>
            <p className="mt-4 text-sm text-slate-700">Email: mike.brown@keystone.com</p>
            <p className="text-sm text-slate-700">Phone: +91 98765 43201</p>
            <p className="text-sm text-slate-700">Employee ID: TECH-102</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Skills</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['HVAC', 'Electrical', 'Plumbing'].map((skill) => (
                <span key={skill} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
