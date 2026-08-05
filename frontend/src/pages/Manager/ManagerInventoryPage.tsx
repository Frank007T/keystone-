import { useEffect, useState, FormEvent } from 'react';
import { fetchPartInventory, createPart, updatePart, Part, PartRequest } from '../../lib/api';

export function ManagerInventoryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [formData, setFormData] = useState<PartRequest>({
    name: '',
    sku: '',
    category: '',
    stock: 0,
    unitPrice: 0,
  });

  const loadInventory = () => {
    setLoading(true);
    fetchPartInventory()
      .then(setParts)
      .catch((err) => setError(err.response?.data?.message || err.message || 'Unable to load inventory.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleOpenAddModal = () => {
    setEditingPart(null);
    setFormData({ name: '', sku: '', category: '', stock: 0, unitPrice: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (part: Part) => {
    setEditingPart(part);
    setFormData({
      name: part.name,
      sku: part.sku,
      category: part.category,
      stock: part.stock,
      unitPrice: part.unitPrice,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingPart && editingPart.id) {
        await updatePart(editingPart.id, formData);
      } else {
        await createPart(formData);
      }
      setIsModalOpen(false);
      loadInventory(); // Refresh inventory list
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save part.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Inventory</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Manage spare parts and assets</h2>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary/90 transition-all"
          >
            Add Part
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="bg-slate-50">
              <tr>
                {['Part Name', 'SKU', 'Category', 'Stock', 'Unit Price', 'Actions'].map((heading) => (
                  <th key={heading} className="px-6 py-4 font-medium text-slate-500">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">Loading parts...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-rose-600">{error}</td>
                </tr>
              ) : parts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">No parts found.</td>
                </tr>
              ) : (
                parts.map((part) => (
                  <tr key={part.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-950">{part.name}</td>
                    <td className="px-6 py-4">{part.sku}</td>
                    <td className="px-6 py-4">{part.category}</td>
                    <td className="px-6 py-4">{part.stock}</td>
                    <td className="px-6 py-4">
                      {part.unitPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleOpenEditModal(part)}
                        className="font-semibold text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Part Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-slate-900">
              {editingPart ? 'Edit Part' : 'Add New Part'}
            </h3>
            
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500">Part Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500">SKU</label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500">Category</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500">Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-soft hover:bg-primary/90"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}