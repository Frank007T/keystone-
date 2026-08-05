import { useEffect, useState } from 'react';
import { 
  Users, 
  Truck, 
  Wrench, 
  ClipboardList, 
  Eye, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  UserPlus, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { 
  fetchAdminDashboard, 
  deleteRequest, 
  type AdminDashboardResponse 
} from '../../lib/api'; 

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const loadDashboard = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAdminDashboard(page, 5);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(currentPage);
  }, [currentPage]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await deleteRequest(id);
      loadDashboard(currentPage);
    } catch (err: any) {
      alert(err.message || 'Failed to delete request');
    }
  };

  if (loading && !data) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Loading dashboard data...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-3 rounded-2xl bg-rose-50 p-6 text-center">
        <AlertCircle className="h-10 w-10 text-rose-600" />
        <h3 className="text-lg font-bold text-rose-900">Unable to load dashboard</h3>
        <p className="text-sm text-rose-700">{error}</p>
        <button 
          onClick={() => loadDashboard(currentPage)}
          className="mt-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, distribution, activities, requests, totalRequestCount } = data;

  return (
    <div className="space-y-6">
      {/* Metrics Section */}
      <div className="grid grid-cols-4 gap-6">
        <div className="flex items-center justify-between rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Managers</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">{metrics.totalManagers}</h3>
            {metrics.managersGrowth !== undefined && (
              <p className="mt-1 text-xs font-semibold text-emerald-600">
                ↑ {metrics.managersGrowth}% <span className="text-slate-400 font-normal">from last month</span>
              </p>
            )}
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Users size={22} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Dispatchers</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">{metrics.totalDispatchers}</h3>
            {metrics.dispatchersGrowth !== undefined && (
              <p className="mt-1 text-xs font-semibold text-emerald-600">
                ↑ {metrics.dispatchersGrowth}% <span className="text-slate-400 font-normal">from last month</span>
              </p>
            )}
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <Truck size={22} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Technicians</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">{metrics.totalTechnicians}</h3>
            {metrics.techniciansGrowth !== undefined && (
              <p className="mt-1 text-xs font-semibold text-emerald-600">
                ↑ {metrics.techniciansGrowth}% <span className="text-slate-400 font-normal">from last month</span>
              </p>
            )}
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Wrench size={22} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Requests</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">{metrics.totalRequests}</h3>
            {metrics.requestsGrowth !== undefined && (
              <p className="mt-1 text-xs font-semibold text-emerald-600">
                ↑ {metrics.requestsGrowth}% <span className="text-slate-400 font-normal">from last month</span>
              </p>
            )}
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600">
            <ClipboardList size={22} />
          </div>
        </div>
      </div>

      {/* Distribution & Activities */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">User Distribution</h2>
          <div className="mt-6 flex items-center gap-8">
            <div className="relative grid h-44 w-44 place-items-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#e2e8f0" strokeWidth="4" />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.915" 
                  fill="transparent" 
                  stroke="#f97316" 
                  strokeWidth="4" 
                  strokeDasharray={`${distribution.total ? (distribution.customers / distribution.total) * 100 : 0} 100`} 
                  strokeDashoffset="0" 
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-lg font-bold text-slate-900">{distribution.total}</p>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Managers</span>
                <span className="font-semibold text-slate-800">{distribution.managers}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Dispatchers</span>
                <span className="font-semibold text-slate-800">{distribution.dispatchers}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Technicians</span>
                <span className="font-semibold text-slate-800">{distribution.technicians}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Customers</span>
                <span className="font-semibold text-slate-800">{distribution.customers}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">Recent Activities</h2>
          <div className="mt-4 space-y-4">
            {activities.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">No recent activities found.</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-600">
                      <UserPlus size={16} />
                    </div>
                    <p className="text-sm font-medium text-slate-700">{act.message}</p>
                  </div>
                  <span className="text-xs text-slate-400">{act.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Work Orders / Requests Table */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-slate-800">Recent Requests</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="py-3 px-2 font-semibold">ID</th>
                <th className="py-3 px-2 font-semibold">Title</th>
                <th className="py-3 px-2 font-semibold">Site</th>
                <th className="py-3 px-2 font-semibold">Customer Email</th>
                <th className="py-3 px-2 font-semibold">Priority</th>
                <th className="py-3 px-2 font-semibold">Status</th>
                <th className="py-3 px-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-slate-400">
                    No requests found in backend database.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id}>
                    <td className="py-3.5 px-2 font-medium text-slate-500">#{req.id}</td>
                    <td className="py-3.5 px-2 font-medium text-slate-900">{req.title}</td>
                    <td className="py-3.5 px-2">{req.siteName}</td>
                    <td className="py-3.5 px-2 text-slate-500">{req.customerEmail}</td>
                    <td className="py-3.5 px-2 text-slate-500">{req.priority}</td>
                    <td className="py-3.5 px-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        req.status === 'Approved' || req.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                        req.status === 'Rejected' ? 'bg-rose-50 text-rose-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50">
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(req.id)} 
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
          <p>Showing 1 to {requests.length} of {totalRequestCount} entries</p>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-semibold text-slate-800 px-2">{currentPage}</span>
            <button 
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}