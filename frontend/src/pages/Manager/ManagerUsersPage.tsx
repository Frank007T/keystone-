import { useEffect, useState } from 'react';
import { fetchManagerUsers, User } from '../../lib/api';

export function ManagerUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchManagerUsers()
      .then(setUsers)
      .catch((err) => setError(err.message || 'Unable to load users.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Users</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Manage user accounts and access</h2>
          </div>
          <button className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary/90">
            Add User
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="bg-slate-50">
              <tr>
                {['Name', 'Role', 'Email', 'Status', 'Actions'].map((heading) => (
                  <th key={heading} className="px-6 py-4 font-medium text-slate-500">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Loading users...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-rose-600">{error}</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No users found in your zone.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.email} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-950">{user.fullName}</td>
                    <td className="px-6 py-4 capitalize">{user.role}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.enabled ? 'Active' : 'Pending'}</td>
                    <td className="px-6 py-4 text-primary cursor-pointer hover:underline">Edit</td>
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