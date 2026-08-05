import React, { useEffect, useState } from 'react';
import {
  fetchManagerDispatchers,
  createDispatcher,
  editDispatcher,
  deleteDispatcher,
  resetDispatcherPassword,
  Dispatcher,
} from '../../lib/api';

export default function ManagerDispatchersPage() {
  const [dispatchers, setDispatchers] = useState<Dispatcher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDispatcher, setEditingDispatcher] = useState<Dispatcher | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [zoneId, setZoneId] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadDispatchers();
  }, []);

  const loadDispatchers = async () => {
    try {
      setLoading(true);
      setError('');
      // Hits GET /api/data/manager/dispatchers
      const data = await fetchManagerDispatchers();
      setDispatchers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dispatchers.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (dispatcher?: Dispatcher) => {
    if (dispatcher) {
      setEditingDispatcher(dispatcher);
      setFullName(dispatcher.fullName);
      setEmail(dispatcher.email);
      setPhone(dispatcher.phone);
      setZoneId(dispatcher.zoneId || 1);
    } else {
      setEditingDispatcher(null);
      setFullName('');
      setEmail('');
      setPhone('');
      setZoneId(1);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDispatcher(null);
    setFullName('');
    setEmail('');
    setPhone('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingDispatcher) {
        await editDispatcher(editingDispatcher.id, fullName, phone, zoneId);
      } else {
        await createDispatcher(fullName, email, phone, zoneId);
      }
      handleCloseModal();
      await loadDispatchers();
    } catch (err: any) {
      setError(err.message || 'Failed to save dispatcher.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this dispatcher?')) return;
    try {
      await deleteDispatcher(id);
      await loadDispatchers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete dispatcher.');
    }
  };

  const handleResetPassword = async (id: number) => {
    try {
      const message = await resetDispatcherPassword(id);
      alert(message || 'Password reset link sent successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Dispatchers</h1>
          <p className="text-sm text-gray-500">View and manage dispatchers within your assigned zone</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition"
        >
          + Add Dispatcher
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Dispatchers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading dispatchers...</div>
        ) : dispatchers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No dispatchers found for this zone.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Zone ID</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {dispatchers.map((dispatcher) => (
                <tr key={dispatcher.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{dispatcher.fullName}</td>
                  <td className="p-4 text-gray-600">
                    <div>{dispatcher.email}</div>
                    <div className="text-xs text-gray-400">{dispatcher.phone}</div>
                  </td>
                  <td className="p-4 text-gray-600">{dispatcher.zoneId ?? 'N/A'}</td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        dispatcher.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {dispatcher.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleResetPassword(dispatcher.id)}
                      className="text-amber-600 hover:text-amber-800 font-medium"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => handleOpenModal(dispatcher)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dispatcher.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingDispatcher ? 'Edit Dispatcher' : 'Create Dispatcher'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg p-2 mt-1 focus:ring-indigo-500 border-gray-300"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {!editingDispatcher && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full border rounded-lg p-2 mt-1 focus:ring-indigo-500 border-gray-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg p-2 mt-1 focus:ring-indigo-500 border-gray-300"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Zone ID</label>
                <input
                  type="number"
                  required
                  className="w-full border rounded-lg p-2 mt-1 focus:ring-indigo-500 border-gray-300"
                  value={zoneId}
                  onChange={(e) => setZoneId(Number(e.target.value))}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  {submitting ? 'Saving...' : editingDispatcher ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}