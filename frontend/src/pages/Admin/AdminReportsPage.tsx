import { AlertCircle, BarChart3, Briefcase, Clock3, PieChart, TrendingUp, Users } from 'lucide-react';
import {
  useDashboardReport,
  useManagerPerformance,
  useRevenueReport,
  useRequestSummary,
  useSlaHealth,
  useTeamAllocation,
  useZoneAnalytics,
} from '../../hooks/useReports';

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function AdminReportsPage() {
  const dashboard = useDashboardReport();
  const requestSummary = useRequestSummary();
  const revenue = useRevenueReport();
  const managerPerformance = useManagerPerformance();
  const teamAllocation = useTeamAllocation();
  const slaHealth = useSlaHealth();
  const zoneAnalytics = useZoneAnalytics();

  const isLoading = dashboard.isLoading || requestSummary.isLoading || revenue.isLoading || managerPerformance.isLoading || teamAllocation.isLoading || slaHealth.isLoading || zoneAnalytics.isLoading;
  const error = dashboard.error || requestSummary.error || revenue.error || managerPerformance.error || teamAllocation.error || slaHealth.error || zoneAnalytics.error;

  if (isLoading) {
    return <div className="rounded-[32px] bg-white p-8 text-slate-600 shadow-soft">Loading live analytics…</div>;
  }

  if (error) {
    return (
      <div className="rounded-[32px] border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-soft">
        <div className="flex items-center gap-2">
          <AlertCircle size={18} />
          <span>Unable to load analytics right now.</span>
        </div>
      </div>
    );
  }

  const dashboardData = dashboard.data;
  const requestData = requestSummary.data;
  const revenueData = revenue.data;
  const managers = managerPerformance.data || [];
  const teamData = teamAllocation.data;
  const slaData = slaHealth.data;
  const zones = zoneAnalytics.data || [];

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Executive reports</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Live operational analytics</h2>
        <p className="mt-4 max-w-2xl text-slate-600">
          Every card, chart, and activity line below is pulled from the current PostgreSQL-backed reporting endpoints.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-primary">
            <Users size={22} />
            <h3 className="text-lg font-semibold text-slate-950">Active users</h3>
          </div>
          <div className="mt-6 text-4xl font-bold text-slate-950">{formatNumber(dashboardData?.activeUsers ?? 0)}</div>
          <p className="mt-2 text-sm text-slate-600">{dashboardData?.totalUsers ?? 0} total accounts across the platform</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-700">
            <BarChart3 size={22} />
            <h3 className="text-lg font-semibold text-slate-950">Pending requests</h3>
          </div>
          <div className="mt-6 text-4xl font-bold text-slate-950">{formatNumber(dashboardData?.pendingRequests ?? 0)}</div>
          <p className="mt-2 text-sm text-slate-600">{dashboardData?.openRequests ?? 0} open and {dashboardData?.reopenedRequests ?? 0} reopened</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-indigo-700">
            <TrendingUp size={22} />
            <h3 className="text-lg font-semibold text-slate-950">Revenue</h3>
          </div>
          <div className="mt-6 text-4xl font-bold text-slate-950">{formatCurrency(revenueData?.totalRevenue ?? 0)}</div>
          <p className="mt-2 text-sm text-slate-600">{revenueData?.invoices ?? 0} invoices and {formatCurrency(revenueData?.collections ?? 0)} collected</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-amber-700">
            <PieChart size={22} />
            <h3 className="text-lg font-semibold text-slate-950">SLA health</h3>
          </div>
          <div className="mt-6 text-4xl font-bold text-slate-950">{formatPercent(slaData?.averageSlaPercent ?? 0)}</div>
          <p className="mt-2 text-sm text-slate-600">{slaData?.metSla ?? 0} met SLA and {slaData?.breachedSla ?? 0} breached</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Request workload</h3>
              <p className="mt-1 text-sm text-slate-600">Created today and completed today from live records</p>
            </div>
            <Clock3 className="text-slate-400" size={20} />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Created</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{requestData?.requestsCreatedToday ?? 0}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Completed</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{requestData?.requestsCompletedToday ?? 0}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Avg. completion</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{requestData?.averageCompletionTimeHours?.toFixed(1) ?? 0}h</div>
            </div>
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Priority mix</h4>
            <div className="mt-3 space-y-2">
              {(dashboardData?.topRequestCategories ?? []).map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-sm text-slate-700">{item.name}</span>
                  <span className="font-semibold text-slate-950">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Revenue pulse</h3>
              <p className="mt-1 text-sm text-slate-600">Snapshot by day, week, month, and year</p>
            </div>
            <Briefcase className="text-slate-400" size={20} />
          </div>
          <div className="mt-6 space-y-3">
            {[...(revenueData?.dailyRevenue ?? []), ...(revenueData?.weeklyRevenue ?? []), ...(revenueData?.monthlyRevenue ?? []), ...(revenueData?.yearlyRevenue ?? [])].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-700">{item.label}</span>
                <span className="font-semibold text-slate-950">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Manager performance</h3>
          <p className="mt-1 text-sm text-slate-600">Completion rate and workload for each manager</p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Manager</th>
                  <th className="px-4 py-3">Assigned</th>
                  <th className="px-4 py-3">Completed</th>
                  <th className="px-4 py-3">Rate</th>
                </tr>
              </thead>
              <tbody>
                {managers.map((manager) => (
                  <tr key={manager.name} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-900">{manager.name}</td>
                    <td className="px-4 py-3">{manager.assignedRequests}</td>
                    <td className="px-4 py-3">{manager.completed}</td>
                    <td className="px-4 py-3">{formatPercent(manager.completionPercent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Team allocation</h3>
          <p className="mt-1 text-sm text-slate-600">Current staffing coverage and utilization</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Managers</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{teamData?.managersAvailable ?? 0}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Dispatchers</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{teamData?.dispatchersAvailable ?? 0}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Technicians</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{teamData?.techniciansAvailable ?? 0}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Utilization</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{formatPercent(teamData?.utilizationPercent ?? 0)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">SLA and escalation health</h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Met SLA</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{slaData?.metSla ?? 0}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Breaches</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{slaData?.breachedSla ?? 0}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Critical tickets</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{slaData?.criticalTickets ?? 0}</div>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Zone analytics</h3>
          <div className="mt-4 space-y-2">
            {zones.map((zone) => (
              <div key={zone.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-700">{zone.name}</span>
                <span className="font-semibold text-slate-950">{zone.requests} req · {formatPercent(zone.completionPercent)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-950">Recent activity</h3>
        <div className="mt-4 space-y-3">
          {(dashboardData?.recentActivities ?? []).map((activity, index) => (
            <div key={`${activity.time}-${index}`} className="flex items-start justify-between rounded-2xl border border-slate-200 px-4 py-3">
              <div>
                <div className="font-medium text-slate-900">{activity.action}</div>
                <div className="text-sm text-slate-500">{activity.user} • {activity.time}</div>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{activity.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
