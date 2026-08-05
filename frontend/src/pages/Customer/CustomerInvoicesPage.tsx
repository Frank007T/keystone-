import { useEffect, useState } from 'react';
import { fetchMyInvoices, Invoice } from '../../lib/api';

export function CustomerInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyInvoices()
      .then(setInvoices)
      .catch((err) => setError(err.message || 'Unable to load invoices.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Invoices</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">View your invoices</h2>
        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="bg-slate-50">
              <tr>
                {['Invoice ID', 'Date', 'Amount', 'Status', 'Actions'].map((heading) => (
                  <th key={heading} className="px-6 py-4 font-medium text-slate-500">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Loading invoices...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-rose-600">{error}</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No invoices found.</td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.invoiceNumber} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-950">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4">{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4">₹{invoice.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">{invoice.status}</td>
                    <td className="px-6 py-4 text-primary">View</td>
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
