import { useEffect, useState } from 'react';
import { fetchMyTimeLogs, TimeLog } from '../../lib/api';

export function TechnicianTimeLogPage() {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyTimeLogs()
      .then(setTimeLogs)
      .catch((err) => setError(err.message || 'Unable to load time logs.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Time Log</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Track job time entries</h2>
        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="bg-slate-50">
              <tr>
                {['Job ID', 'Start', 'End', 'Duration', 'Notes'].map((heading) => (
                  <th key={heading} className="px-6 py-4 font-medium text-slate-500">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Loading time logs...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-rose-600">{error}</td>
                </tr>
              ) : timeLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No time logs found.</td>
                </tr>
              ) : (
                timeLogs.map((log) => (
                  <tr key={`${log.workOrderId}-${log.startTime}`} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-950">WO-{log.workOrderId}</td>
                    <td className="px-6 py-4">{new Date(log.startTime).toLocaleString()}</td>
                    <td className="px-6 py-4">{log.endTime ? new Date(log.endTime).toLocaleString() : 'In Progress'}</td>
                    <td className="px-6 py-4">{log.endTime ? `${Math.max(0, Math.ceil((new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 3600000))}h` : '—'}</td>
                    <td className="px-6 py-4">{log.notes}</td>
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
