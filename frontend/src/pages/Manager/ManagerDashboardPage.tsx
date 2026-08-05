import { useEffect, useState } from 'react';
import { fetchManagerCustomers, fetchManagerTechnicians, fetchManagerWorkOrders, fetchPartInventory, Part, Technician, User, WorkOrder } from '../../lib/api';

export function ManagerDashboardPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchManagerWorkOrders(), fetchManagerCustomers(), fetchManagerTechnicians(), fetchPartInventory()])
      .then(([orders, customersResult, techniciansResult, partsResult]) => {
        setWorkOrders(orders);
        setCustomers(customersResult);
        setTechnicians(techniciansResult);
        setParts(partsResult);
      })
      .catch((err) => setError(err.message || 'Unable to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const totalWorkOrders = workOrders.length;
  const processingCount = workOrders.filter((order) => (order.status || '').toString().toLowerCase().includes('processing')).length;
  const successCount = workOrders.filter((order) => (order.status || '').toString().toLowerCase().includes('success')).length;
  const failedCount = workOrders.filter((order) => (order.status || '').toString().toLowerCase().includes('failed')).length;
  const overdueCount = workOrders.filter((order) => {
    if (!order.dueDate) return false;
    const due = new Date(order.dueDate);
    return !Number.isNaN(due.getTime()) && due < new Date();
  }).length;

  const topTechnicians = technicians.slice(0, 3);

  if (loading) {
    return <div className="text-center text-slate-500">Loading manager dashboard...</div>;
  }

  if (error) {
    return <div className="text-center text-rose-600">{error}</div>;
  }

  return (
    <div className="grid gap-8">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Work Orders', value: totalWorkOrders.toString() },
          { label: 'Processing', value: processingCount.toString() },
          { label: 'Success', value: successCount.toString() },
          { label: 'Failed', value: failedCount.toString() },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[24px] bg-white p-6 shadow-soft">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
            <h3 className="mt-4 text-3xl font-semibold text-slate-950">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.7fr_0.3fr]">
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Work Order Status</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Live performance overview</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {['New', 'Assigned', 'In Progress', 'Completed'].map((status) => (
              <div key={status} className="rounded-[24px] border border-slate-200 p-6">
                <p className="text-sm text-slate-500">{status}</p>
                <p className="mt-4 text-3xl font-semibold text-slate-950">
                  {workOrders.filter((order) => order.status.toLowerCase().includes(status.toLowerCase())).length}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Top Technicians</p>
          <div className="mt-6 space-y-4">
            {topTechnicians.length === 0 ? (
              <p className="text-sm text-slate-500">No technicians available yet.</p>
            ) : (
              topTechnicians.map((technician) => (
                <div key={technician.email} className="flex items-center justify-between rounded-[24px] border border-slate-200 p-4">
                  <div>
                    <p className="font-semibold text-slate-950">{technician.fullName}</p>
                    <p className="text-sm text-slate-500">Technician</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                    {technician.enabled ? 'Active' : 'Pending'}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 rounded-[24px] border border-slate-200 p-6">
            <p className="text-sm text-slate-500">Parts in inventory</p>
            <p className="mt-4 text-3xl font-semibold text-slate-950">{parts.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
