import { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import {
  listManagers,
  createManager,
  updateManager,
  deleteManager,
  resetManagerPassword,
  type Manager,
} from '../../lib/api'; // Adjust this import path if your api file is named differently

interface OutletContextType {
  selectedZone?: string;
}

// Helper map to translate zone name to a numerical zone ID
const ZONE_MAP: Record<string, number> = {
  North: 1,
  South: 2,
  East: 3,
  West: 4,
};

export function ManageManagersPage() {
  const context = useOutletContext<OutletContextType | null>() || {};
  const selectedZone = context.selectedZone ?? 'All';
  const selectedZoneId = selectedZone === 'All' ? undefined : ZONE_MAP[selectedZone] ?? undefined;

  const [searchParams, setSearchParams] = useSearchParams();

  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    zoneId: selectedZoneId ?? 1,
  });

  // Handle URL query action (e.g. ?action=add)
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsAddModalOpen(true);
    }
  }, [searchParams]);

  // Sync selected zone ID with form
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      zoneId: selectedZoneId ?? 1,
    }));
  }, [selectedZoneId]);

  // Fetch Managers using imported API function
  const fetchManagers = async () => {
    setLoading(true);
    try {
      const data = await listManagers();
      setManagers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching managers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  // Form input handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'zoneId' ? Number(value) : value,
    }));
  };

  // Create Manager
  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createManager({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        zoneId: formData.zoneId,
      });

      closeModal();
      fetchManagers();
    } catch (err: any) {
      alert(err.message || 'Failed to create manager');
    }
  };

  // Edit Manager
  const handleUpdateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManager) return;

    try {
      await updateManager(editingManager.id, {
        fullName: formData.fullName,
        phone: formData.phone,
        zoneId: formData.zoneId,
      });

      closeModal();
      fetchManagers();
    } catch (err: any) {
      alert(err.message || 'Failed to update manager');
    }
  };

  // Delete Manager
  const handleDeleteManager = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this manager?')) return;

    try {
      await deleteManager(id);
      fetchManagers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete manager');
    }
  };

  // Reset Password
  const handleResetPassword = async (id: number) => {
    if (
      !window.confirm(
        'Reset this manager password and send a new temporary password via email?'
      )
    )
      return;

    try {
      const msg = await resetManagerPassword(id);
      alert(msg || 'Password reset successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    }
  };

  // Modal helpers
  const openAddModal = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      zoneId: selectedZoneId ?? 1,
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (manager: Manager) => {
    setEditingManager(manager);
    setFormData({
      fullName: manager.fullName,
      email: manager.email,
      phone: manager.phone,
      zoneId: manager.zoneId || 1,
    });
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingManager(null);
    if (searchParams.has('action')) {
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  };

  // Filtered List
  const filteredManagers = managers.filter((m) => {
    const matchesZone = selectedZoneId === undefined || m.zoneId === selectedZoneId;
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery);

    return matchesZone && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manage Managers</h2>
          <p className="text-sm text-slate-500">
            Viewing records for{' '}
            <span className="font-semibold text-slate-700">
              {selectedZone === 'All' ? 'all zones' : `${selectedZone} Zone`}
            </span>
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800"
        >
          + Add New Manager
        </button>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700 border border-rose-200">
          {error}
        </div>
      )}

      {/* Managers Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            Loading managers...
          </div>
        ) : filteredManagers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No managers found for {selectedZone === 'All' ? 'the selected filters' : `${selectedZone} Zone`}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredManagers.map((manager) => (
                  <tr
                    key={manager.id}
                    className="transition hover:bg-slate-50/50"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {manager.fullName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span>{manager.email}</span>
                        <span className="text-xs text-slate-400">
                          {manager.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          manager.enabled
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {manager.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(manager.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(manager)}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleResetPassword(manager.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleDeleteManager(manager.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || editingManager) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-slate-900">
              {editingManager ? 'Edit Manager' : 'Add New Manager'}
            </h3>

            <form
              onSubmit={editingManager ? handleUpdateManager : handleCreateManager}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400"
                />
              </div>

              {!editingManager && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Zone
                </label>
                <select
                  name="zoneId"
                  value={formData.zoneId}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400"
                >
                  <option value={1}>North Zone</option>
                  <option value={2}>South Zone</option>
                  <option value={3}>East Zone</option>
                  <option value={4}>West Zone</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  {editingManager ? 'Save Changes' : 'Create Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}