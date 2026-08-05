import { useEffect, useState } from 'react';
// Import the typed helper function from api.ts
import { fetchWorkOrders, WorkOrder } from '../../lib/api'; // adjust import path as needed

const KANBAN_COLUMNS = [
  { label: 'New', key: 'NEW' },
  { label: 'Assigned', key: 'ASSIGNED' },
  { label: 'In Progress', key: 'IN_PROGRESS' },
  { label: 'On Hold', key: 'ON_HOLD' },
  { label: 'Completed', key: 'COMPLETED' },
];

export function DispatcherKanbanPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkOrders()
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch work orders:', err);
        setError('Access Forbidden (403): You do not have permission or your session expired.');
        setLoading(false);
      });
  }, []);

  const getOrdersByColumn = (columnKey: string, columnLabel: string) => {
    return orders.filter((wo) => {
      if (!wo.status) return false;
      const statusNormalized = wo.status.toUpperCase().replace(/\s+/g, '_');
      const keyNormalized = columnKey.toUpperCase();
      const labelNormalized = columnLabel.toUpperCase().replace(/\s+/g, '_');
      return statusNormalized === keyNormalized || statusNormalized === labelNormalized;
    });
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading Kanban board...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-200">
          <p className="font-semibold">Error Loading Board</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Kanban Board</p>
      <div className="grid gap-4 lg:grid-cols-5">
        {KANBAN_COLUMNS.map(({ label, key }) => {
          const columnOrders = getOrdersByColumn(key, label);

          return (
            <div key={key} className="rounded-[24px] bg-slate-50 p-4 shadow-sm min-h-[400px]">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{label}</p>
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                  {columnOrders.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnOrders.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">No items</p>
                ) : (
                  columnOrders.map((wo) => (
                    <div key={wo.id} className="rounded-[24px] bg-white p-4 shadow-xs">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-950">
                          Work Order #{wo.id}
                        </p>
                        {wo.priority && (
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {wo.priority}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        {wo.title}
                      </p>
                      {wo.siteName && (
                        <p className="mt-2 text-xs text-slate-400">{wo.siteName}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}