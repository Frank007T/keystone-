import { useEffect, useState } from 'react';
import { fetchDispatcherTechnicians, fetchDispatcherWorkOrders, Technician, WorkOrder } from '../../lib/api';

export function DispatcherDashboardPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // ✅ Use fetchDispatcherTechnicians instead of fetchManagerTechnicians
    Promise.all([fetchDispatcherWorkOrders(), fetchDispatcherTechnicians()])
      .then(([orders, techniciansResult]) => {
        setWorkOrders(orders);
        setTechnicians(techniciansResult);
      })
      .catch((err) => setError(err.message || 'Unable to load dispatcher dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const statusCounts = ['New', 'Assigned', 'In Progress', 'On Hold', 'Completed'].map((status) => ({
    status,
    count: workOrders.filter((order) => order.status.toLowerCase().includes(status.toLowerCase())).length,
  }));

  const summaryItems = [
    { label: 'Requests', value: workOrders.length },
    { label: 'Assigned', value: statusCounts.find((item) => item.status === 'Assigned')?.count ?? 0 },
    { label: 'In Progress', value: statusCounts.find((item) => item.status === 'In Progress')?.count ?? 0 },
    { label: 'Completed', value: statusCounts.find((item) => item.status === 'Completed')?.count ?? 0 },
  ];

  if (loading) {
    return <div className="text-center text-slate-500">Loading dispatcher dashboard...</div>;
  }

  if (error) {
    return <div className="text-center text-rose-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <div key={item.label} className="rounded-[24px] bg-slate-50 p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-950">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.6fr_0.4fr]">
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Work Order Overview</p>
          <div className="mt-6 space-y-4">
            {statusCounts.map((status) => (
              <div key={status.status} className="flex items-center justify-between rounded-[24px] border border-slate-200 p-4">
                <p className="font-semibold text-slate-950">{status.status}</p>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{status.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Technician Availability</p>
          <div className="mt-6 space-y-4">
            {['Available', 'Busy', 'Offline'].map((status) => (
              <div key={status} className="rounded-[24px] border border-slate-200 p-4">
                <p className="font-semibold text-slate-950">{status}</p>
                <p className="text-sm text-slate-500">{technicians.filter((tech) => tech.enabled === (status !== 'Offline')).length} technicians</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}