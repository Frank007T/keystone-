export function CustomerHelpPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Help & Support</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Customer support</h2>
        <div className="mt-6 space-y-4">
          <p className="text-sm text-slate-600">Need assistance? Contact our service desk for request updates and technical support.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-950">Email</p>
              <p className="mt-2 text-sm text-slate-700">support@keystone.com</p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-950">Phone</p>
              <p className="mt-2 text-sm text-slate-700">+91 98765 43210</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
