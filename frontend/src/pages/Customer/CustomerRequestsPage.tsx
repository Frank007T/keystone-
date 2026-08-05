import { useEffect, useState } from 'react';
import { fetchMyRequests, WorkOrder } from '../../lib/api';

export function CustomerRequestsPage() {
  const [requests, setRequests] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyRequests()
      .then(setRequests)
      .catch((err) => setError(err.message || 'Unable to load requests.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">My Requests</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Track your maintenance requests</h2>
        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="bg-slate-50">
              <tr>
                {['Request ID', 'Subject', 'Site', 'Priority', 'Status', 'Created On'].map((heading) => (
                  <th key={heading} className="px-6 py-4 font-medium text-slate-500">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    Loading requests...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-rose-600">{error}</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    No requests found.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-950">REQ-{request.id}</td>
                    <td className="px-6 py-4">{request.title}</td>
                    <td className="px-6 py-4">{request.siteName}</td>
                    <td className="px-6 py-4">{request.priority}</td>
                    <td className="px-6 py-4">{request.status}</td>
                    <td className="px-6 py-4">{new Date(request.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
