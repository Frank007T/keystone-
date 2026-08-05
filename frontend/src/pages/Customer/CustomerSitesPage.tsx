import { useEffect, useState, FormEvent } from 'react';
import { fetchMySites, createSite, updateSite, deleteSite, Site } from '../../lib/api';

export function CustomerSitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactName: '',
    contactPhone: '',
    status: 'ACTIVE',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadSites = () => {
    setLoading(true);
    fetchMySites()
      .then(setSites)
      .catch((err) => setError(err.message || 'Unable to load sites.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSites();
  }, []);

  const openAddModal = () => {
    setEditingSite(null);
    setFormData({ name: '', address: '', contactName: '', contactPhone: '', status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const openEditModal = (site: Site) => {
    setEditingSite(site);
    setFormData({
      name: site.name,
      address: site.address,
      contactName: site.contactName,
      contactPhone: site.contactPhone,
      status: site.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSite) {
        await updateSite(editingSite.id, formData);
      } else {
        await createSite(formData);
      }
      setIsModalOpen(false);
      loadSites();
    } catch (err: any) {
      alert(err.message || 'Failed to save site.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this site?')) return;
    try {
      await deleteSite(id);
      loadSites();
    } catch (err: any) {
      alert(err.message || 'Failed to delete site.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">My Sites</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Your site locations</h2>
          </div>
          <button
            onClick={openAddModal}
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary/90"
          >
            Add Site
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="bg-slate-50">
              <tr>
                {['Site Name', 'Address', 'Contact', 'Status', 'Actions'].map((heading) => (
                  <th key={heading} className="px-6 py-4 font-medium text-slate-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Loading sites...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-rose-600">
                    {error}
                  </td>
                </tr>
              ) : sites.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    No sites found.
                  </td>
                </tr>
              ) : (
                sites.map((site) => (
                  <tr key={site.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-950">{site.name}</td>
                    <td className="px-6 py-4">{site.address}</td>
                    <td className="px-6 py-4">
                      <div>{site.contactName}</div>
                      <div className="text-xs text-slate-400">{site.contactPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {site.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-3">
                      <button
                        onClick={() => openEditModal(site)}
                        className="font-semibold text-primary hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(site.id)}
                        className="font-semibold text-rose-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT SITE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-950">
              {editingSite ? 'Edit Site' : 'Add New Site'}
            </h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500">Site Name</label>
                <input
                  required
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-primary"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500">Address</label>
                <input
                  required
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-primary"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500">Contact Name</label>
                  <input
                    required
                    type="text"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-primary"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500">Phone</label>
                  <input
                    required
                    type="text"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-primary"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-primary/90"
                >
                  {submitting ? 'Saving...' : editingSite ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}