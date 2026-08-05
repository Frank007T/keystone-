import { useEffect, useState } from 'react';
import { fetchMyNotifications, fetchTechnicianJobs, Notification, WorkOrder } from '../../lib/api';

export function TechnicianDashboardPage() {
  const [jobs, setJobs] = useState<WorkOrder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchTechnicianJobs(), fetchMyNotifications()])
      .then(([jobsResult, notificationsResult]) => {
        setJobs(jobsResult);
        setNotifications(notificationsResult);
      })
      .catch((err) => setError(err.message || 'Unable to load technician dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const inProgressCount = jobs.filter((job) => job.status.toLowerCase().includes('progress')).length;
  const completedCount = jobs.filter((job) => job.status.toLowerCase().includes('completed')).length;
  const onHoldCount = jobs.filter((job) => job.status.toLowerCase().includes('hold')).length;

  if (loading) {
    return <div className="text-center text-slate-500">Loading technician dashboard...</div>;
  }

  if (error) {
    return <div className="text-center text-rose-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Today's Jobs", value: jobs.length },
          { label: 'In Progress', value: inProgressCount },
          { label: 'Completed', value: completedCount },
          { label: 'On Hold', value: onHoldCount },
        ].map((item) => (
          <div key={item.label} className="rounded-[24px] bg-slate-50 p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-950">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.65fr_0.35fr]">
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Job Status</p>
            <button className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white">View all jobs</button>
          </div>
          <div className="mt-8 grid gap-4">
            {jobs.slice(0, 3).map((job) => (
              <div key={job.id} className="rounded-[24px] border border-slate-200 p-4">
                <p className="font-semibold text-slate-950">{job.title}</p>
                <p className="mt-1 text-sm text-slate-500">{job.siteName}</p>
              </div>
            ))}
            {jobs.length === 0 && <p className="text-sm text-slate-500">No jobs assigned.</p>}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Announcements</p>
          <div className="mt-6 space-y-4">
            {notifications.slice(0, 3).map((item) => (
              <div key={`${item.title}-${item.createdAt}`} className="rounded-[24px] border border-slate-200 p-4">
                <p className="font-semibold text-slate-950">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.message}</p>
              </div>
            ))}
            {notifications.length === 0 && <p className="text-sm text-slate-500">No announcements yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
