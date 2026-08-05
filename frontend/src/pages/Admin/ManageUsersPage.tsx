import { useEffect, useState } from 'react';
import { Search, Loader2, AlertCircle, Shield, User as UserIcon } from 'lucide-react';
import { fetchAllUsers, type User } from '../../lib/api'; // Adjust path if needed

export function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter States
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch real users from Spring Boot GET /api/data/manager/users
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter logic for Roles and Search
  const filteredUsers = users.filter((user) => {
    const matchesRole = 
      selectedRole === 'all' || 
      user.role?.toLowerCase() === selectedRole.toLowerCase();

    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query) ||
      user.companyName?.toLowerCase().includes(query);

    return matchesRole && matchesSearch;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'manager':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'dispatcher':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'technician':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'customer':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
        <p className="text-sm text-slate-500">View and filter all system users by role and company</p>
      </div>

      {/* Control Bar: Role Tabs & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        
        {/* Role Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1">
          {['all', 'manager', 'dispatcher', 'technician', 'customer'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                selectedRole === role
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {role === 'all' ? 'All Users' : `${role}s`}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white"
          />
        </div>

      </div>

      {/* Main Table Content */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        
        {loading ? (
          <div className="flex h-64 items-center justify-center gap-2 text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="text-sm">Loading users from server...</span>
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 bg-rose-50/50 text-rose-600 p-6">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={loadUsers}
              className="mt-2 rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">User Info</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No users found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr key={user.email || idx} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & Company */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm uppercase">
                            {user.fullName ? user.fullName.charAt(0) : <UserIcon size={16} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{user.fullName || 'N/A'}</p>
                            {user.companyName && (
                              <p className="text-xs text-slate-400">{user.companyName}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold capitalize ${getRoleBadgeColor(user.role)}`}>
                          <Shield size={12} />
                          {user.role}
                        </span>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-6">
                        <p className="text-xs font-medium text-slate-800">{user.email}</p>
                        <p className="text-xs text-slate-400">{user.phone || 'No phone'}</p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          user.enabled !== false 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                          {user.enabled !== false ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {user.createdAt ? user.createdAt.split('T')[0] : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}