import { useEffect, useState } from 'react';
import { fetchPartInventory, Part } from '../../lib/api';

export function TechnicianPartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPartInventory()
      .then(setParts)
      .catch((err) => setError(err.message || 'Unable to load inventory.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Parts & Inventory</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Manage parts used on jobs</h2>
        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="bg-slate-50">
              <tr>
                {['Part', 'SKU', 'Qty', 'Unit Price', 'Total'].map((heading) => (
                  <th key={heading} className="px-6 py-4 font-medium text-slate-500">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Loading inventory...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-rose-600">{error}</td>
                </tr>
              ) : parts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No parts in inventory.</td>
                </tr>
              ) : (
                parts.map((part) => (
                  <tr key={part.sku} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-950">{part.name}</td>
                    <td className="px-6 py-4">{part.sku}</td>
                    <td className="px-6 py-4">{part.stock}</td>
                    <td className="px-6 py-4">₹{part.unitPrice.toFixed(2)}</td>
                    <td className="px-6 py-4">₹{(part.stock * part.unitPrice).toFixed(2)}</td>
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
