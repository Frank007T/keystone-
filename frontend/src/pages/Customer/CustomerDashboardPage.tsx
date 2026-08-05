import { useEffect, useState } from 'react';
import { fetchMyInvoices, fetchMyRequests, Invoice, WorkOrder } from '../../lib/api';

export function CustomerDashboardPage() {
  const [requests, setRequests] = useState<WorkOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchMyRequests(), fetchMyInvoices()])
      .then(([requestsResult, invoicesResult]) => {
        setRequests(requestsResult);
        setInvoices(invoicesResult);
      })
      .catch((err) => setError(err.message || 'Unable to load customer dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const openCount = requests.filter((r) => r.status.toLowerCase().includes('pending') || r.status.toLowerCase().includes('open')).length;
  const inProgressCount = requests.filter((r) => r.status.toLowerCase().includes('progress')).length;
  const completedCount = requests.filter((r) => r.status.toLowerCase().includes('completed')).length;
  const overdueCount = requests.filter((r) => {
    if (!r.dueDate) return false;
    const due = new Date(r.dueDate);
    return !Number.isNaN(due.getTime()) && due < new Date();
  }).length;

  if (loading) {
    return <div className="text-center text-slate-500">Loading customer dashboard...</div>;
  }

  if (error) {
    return <div className="text-center text-rose-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Open Requests', value: openCount },
          { label: 'In Progress', value: inProgressCount },
          { label: 'Completed', value: completedCount },
          { label: 'Overdue', value: overdueCount },
        ].map((item) => (
          <div key={item.label} className="rounded-[24px] bg-slate-50 p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-950">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.6fr_0.4fr]">
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Recent requests</p>
          <div className="mt-6 space-y-4">
            {requests.slice(0, 3).map((request) => (
              <div key={request.id} className="rounded-[24px] border border-slate-200 p-4">
                <p className="font-semibold text-slate-950">{request.title}</p>
                <p className="mt-1 text-sm text-slate-500">{request.description}</p>
              </div>
            ))}
            {requests.length === 0 && <p className="text-sm text-slate-500">No recent requests.</p>}
          </div>
        </div>
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Invoices</p>
          <div className="mt-6 space-y-4">
            {invoices.slice(0, 3).map((invoice) => (
              <div key={invoice.invoiceNumber} className="rounded-[24px] border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-950">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-slate-500">{invoice.status}</p>
                </div>
                <p className="mt-1 text-sm text-slate-500">{invoice.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
              </div>
            ))}
            {invoices.length === 0 && <p className="text-sm text-slate-500">No invoices available.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
