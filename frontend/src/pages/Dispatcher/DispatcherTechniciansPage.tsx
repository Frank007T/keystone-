import { useEffect, useState } from 'react';
import { fetchDispatcherTechnicians, User } from '@/lib/api';

export function DispatcherTechniciansPage() {
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDispatcherTechnicians()
      .then((data) => setTechnicians(data))
      .catch((err) => setError(err.message || 'Failed to fetch technicians'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6">Loading technicians...</div>;
  }

  if (error) {
    return <div className="p-6 text-rose-600">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Technicians</h1>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {technicians.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-slate-500">
                  No technicians found.
                </td>
              </tr>
            ) : (
              technicians.map((tech, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">{tech.fullName}</td>
                  <td className="py-3 px-4 text-slate-600">{tech.email}</td>
                  <td className="py-3 px-4 text-slate-600">{tech.phone || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tech.enabled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {tech.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}