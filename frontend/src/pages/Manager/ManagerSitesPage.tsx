import { useEffect, useState } from 'react';
import { fetchAllSites, Site } from '../../lib/api';

export function ManagerSitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllSites()
      .then(setSites)
      .catch((err) => setError(err.message || 'Unable to load sites.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Sites</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Manage customer locations</h2>
          </div>
          <button className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary/90">
            Add Site
          </button>
        </div>
        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="bg-slate-50">
              <tr>
                {['Site Name', 'Customer', 'Address', 'Status', 'Actions'].map((heading) => (
                  <th key={heading} className="px-6 py-4 font-medium text-slate-500">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Loading sites...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-rose-600">{error}</td>
                </tr>
              ) : sites.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No sites found.</td>
                </tr>
              ) : (
                sites.map((site) => (
                  <tr key={site.name} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-950">{site.name}</td>
                    <td className="px-6 py-4">{site.customerEmail}</td>
                    <td className="px-6 py-4">{site.address}</td>
                    <td className="px-6 py-4">{site.status}</td>
                    <td className="px-6 py-4 text-primary">Edit</td>
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
