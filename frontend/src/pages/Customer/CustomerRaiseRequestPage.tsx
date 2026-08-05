import { useEffect, useState } from 'react';
import { createRequest, fetchMySites, Site } from '../../lib/api';

export function CustomerRaiseRequestPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [siteName, setSiteName] = useState('');
  const [priority, setPriority] = useState('High');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMySites()
      .then((data) => {
        setSites(data);
        setSiteName(data[0]?.name || '');
      })
      .catch((err) => setError(err.message || 'Unable to load sites.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await createRequest({
        title,
        description,
        siteName,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      setMessage('Request submitted successfully.');
      setTitle('');
      setDescription('');
      setDueDate('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit request.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Raise Request</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Create a new maintenance request</h2>
          </div>
          <button
            type="submit"
            disabled={saving || loading}
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>

        {message && <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
        {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span>Subject</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              placeholder="Describe the issue"
              required
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>Site</span>
            <select
              value={siteName}
              onChange={(event) => setSiteName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              required
            >
              {loading ? (
                <option>Loading sites...</option>
              ) : sites.length === 0 ? (
                <option>No sites available</option>
              ) : (
                sites.map((site) => (
                  <option key={site.name} value={site.name}>{site.name}</option>
                ))
              )}
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>Priority</span>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>Due Date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>
        </div>

        <label className="mt-6 space-y-2 text-sm text-slate-700">
          <span>Request Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-[160px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            placeholder="Enter request details..."
            required
          />
        </label>
      </form>
    </div>
  );
}
