export function ManagerProfilePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">My Profile</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Alex Johnson</h2>
            <p className="text-sm text-slate-600">Manager • alex.johnson@keystone.com</p>
          </div>
          <button className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary/90">
            Edit Profile
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Contact</p>
            <p className="mt-4 text-sm text-slate-700">alex.johnson@keystone.com</p>
            <p className="text-sm text-slate-700">+91 98765 43210</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Company</p>
            <p className="mt-4 text-sm text-slate-700">Keystone Facilities Management</p>
            <p className="text-sm text-slate-700">Chennai, Tamil Nadu, India</p>
          </div>
        </div>
      </div>
    </div>
  );
}
