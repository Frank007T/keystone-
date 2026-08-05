import { useEffect, useState } from 'react';
import { fetchManagerCustomers, User } from '../../lib/api';

export function ManagerCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchManagerCustomers()
      .then(setCustomers)
      .catch((err) => setError(err.message || 'Unable to load customers.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Customers</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Manage customer organizations</h2>
          </div>
          <button className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary/90">
            Add Customer
          </button>
        </div>
        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="bg-slate-50">
              <tr>
                {['Company', 'Contact Person', 'Email', 'Status', 'Actions'].map((heading) => (
                  <th key={heading} className="px-6 py-4 font-medium text-slate-500">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Loading customers...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-rose-600">{error}</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No customers found.</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.email} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-950">{customer.companyName}</td>
                    <td className="px-6 py-4">{customer.fullName}</td>
                    <td className="px-6 py-4">{customer.email}</td>
                    <td className="px-6 py-4">{customer.enabled ? 'Active' : 'Pending'}</td>
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
