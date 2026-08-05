export function CustomerProfilePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Profile</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Your account details</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Contact Information</p>
            <p className="mt-4 text-sm text-slate-700">Acme Corp</p>
            <p className="text-sm text-slate-700">acme@acmecorp.com</p>
            <p className="text-sm text-slate-700">+91 98765 43210</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Company Info</p>
            <p className="mt-4 text-sm text-slate-700">Keystone Facilities Management</p>
            <p className="text-sm text-slate-700">123 Business Avenue</p>
            <p className="text-sm text-slate-700">Chennai, TN</p>
          </div>
        </div>
      </div>
    </div>
  );
}
