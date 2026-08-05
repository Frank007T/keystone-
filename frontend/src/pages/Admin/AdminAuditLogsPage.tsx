import { useMemo, useState } from 'react';
import { AlertCircle, ChevronDown, ChevronRight, FileText, Loader2, RefreshCw, Search, X } from 'lucide-react';

import { useAuditLogs, useAuditStatistics } from '../../hooks/useAuditLogs';
import type { AuditLogItem } from '../../types/audit';

const STATUS_META: Record<string, { label: string; icon: string; className: string }> = {
  SUCCESS: { label: 'Success', icon: '✔', className: 'bg-emerald-100 text-emerald-700 shadow-emerald-100' },
  COMPLETED: { label: 'Completed', icon: '✔', className: 'bg-green-100 text-green-700 shadow-green-100' },
  FAILED: { label: 'Failed', icon: '✖', className: 'bg-red-100 text-red-700 shadow-red-100' },
  PENDING: { label: 'Pending', icon: '⏳', className: 'bg-yellow-100 text-yellow-700 shadow-yellow-100' },
  PROCESSING: { label: 'Processing', icon: '⚙', className: 'bg-blue-100 text-blue-700 shadow-blue-100' },
  WARNING: { label: 'Warning', icon: '⚠', className: 'bg-orange-100 text-orange-700 shadow-orange-100' },
  CANCELLED: { label: 'Cancelled', icon: '🚫', className: 'bg-gray-200 text-gray-700 shadow-gray-100' },
  PARTIAL_SUCCESS: { label: 'Partial Success', icon: '➗', className: 'bg-purple-100 text-purple-700 shadow-purple-100' },
};

function getStatusMeta(status?: string) {
  const normalized = (status || '').toUpperCase();
  return STATUS_META[normalized] ?? { label: normalized || 'Pending', icon: '⏳', className: 'bg-yellow-100 text-yellow-700 shadow-yellow-100' };
}

function formatActionLabel(action?: string) {
  const normalized = (action || '').toUpperCase();
  const labels: Record<string, string> = {
    CREATE_MANAGER: 'Created Manager',
    DELETE_USER: 'Deleted User',
    LOGIN: 'User Logged In',
    LOGOUT: 'User Logged Out',
    ASSIGN_DELIVERY: 'Assigned Delivery',
    CREATE_REQUEST: 'Created Service Request',
    CREATE_USER: 'Created User',
    UPDATE_USER: 'Updated User',
    DELETE_MANAGER: 'Deleted Manager',
    CREATE_DISPATCHER: 'Created Dispatcher',
    CREATE_ORDER: 'Created Order',
    DELETE_ORDER: 'Deleted Order',
  };

  return labels[normalized] || normalized.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatEntityLabel(entityType?: string) {
  const normalized = (entityType || '').toUpperCase();
  const labels: Record<string, string> = {
    MANAGER: 'Manager',
    USER: 'User',
    REQUEST: 'Request',
    INVOICE: 'Invoice',
    ORDER: 'Order',
    ASSET: 'Asset',
    ROLE: 'Role',
    CUSTOMER: 'Customer',
    TECHNICIAN: 'Technician',
    DISPATCHER: 'Dispatcher',
  };

  return labels[normalized] || normalized || 'Record';
}

function getDisplayName(log: AuditLogItem) {
  return log.performedByName || log.performedByEmail || 'System';
}

function getWhatHappened(log: AuditLogItem) {
  const action = (log.action || '').toUpperCase();
  const entityName = log.entityId || log.description || '';
  const entityLabel = formatEntityLabel(log.entityType);

  switch (action) {
    case 'CREATE_MANAGER':
      return 'Created a new manager account.';
    case 'DELETE_USER':
      return entityName ? `Deleted ${entityLabel.toLowerCase()} "${entityName}".` : `Deleted the affected ${entityLabel.toLowerCase()}.`;
    case 'LOGIN':
      return 'User signed in to the system.';
    case 'LOGOUT':
      return 'User signed out of the system.';
    case 'ASSIGN_DELIVERY':
      return entityName ? `Assigned delivery to ${entityName}.` : 'Assigned delivery to the selected team.';
    case 'CREATE_REQUEST':
      return 'Created a new service request.';
    case 'CREATE_ORDER':
      return 'Created a new operational order.';
    default:
      return log.description?.trim() || 'Recorded an administrative action in the system.';
  }
}

function getReason(log: AuditLogItem) {
  const description = (log.description || '').toLowerCase();
  if (!description) {
    return 'No reason was provided.';
  }
  if (description.includes('onboard') || description.includes('manager')) {
    return 'Manager onboarding.';
  }
  if (description.includes('customer') || description.includes('request')) {
    return 'Customer requested update.';
  }
  if (description.includes('security') || description.includes('policy')) {
    return 'Security policy.';
  }
  if (description.includes('approval')) {
    return 'Administrative approval.';
  }
  if (description.includes('manual') || description.includes('assign')) {
    return 'Manual assignment.';
  }
  return 'No reason was provided.';
}

function getBusinessImpact(log: AuditLogItem) {
  const action = (log.action || '').toUpperCase();
  switch (action) {
    case 'CREATE_MANAGER':
      return 'Manager now has access to assigned modules and can manage operations.';
    case 'DELETE_USER':
      return 'The user account is no longer active in the system.';
    case 'LOGIN':
      return 'The user can continue working in the system.';
    case 'LOGOUT':
      return 'The session was ended securely.';
    case 'ASSIGN_DELIVERY':
      return 'Delivery is now assigned and can be tracked.';
    case 'CREATE_REQUEST':
      return 'A new service request is now available for processing.';
    default:
      return 'The operation completed successfully and updated the relevant business record.';
  }
}

function getAffectedRecord(log: AuditLogItem) {
  const entityLabel = formatEntityLabel(log.entityType);
  const entityName = log.entityId || log.performedByName || '—';
  return { entityLabel, entityName };
}

function getChangeRows(log: AuditLogItem) {
  if (!log.requestBody) {
    return [];
  }

  try {
    const parsed = JSON.parse(log.requestBody);
    if (parsed && typeof parsed === 'object') {
      if (parsed.before && parsed.after) {
        return [
          { label: 'Updated Field', oldValue: parsed.before, newValue: parsed.after },
        ];
      }
      if (parsed.changes && Array.isArray(parsed.changes)) {
        return parsed.changes.map((item: any) => ({
          label: item.field || 'Updated Field',
          oldValue: item.oldValue ?? '—',
          newValue: item.newValue ?? '—',
        }));
      }
    }
  } catch {
    // ignore and fall back to empty list
  }

  return [];
}

function formatTimestamp(value?: string) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function formatTimeOnly(value?: string) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function AdminAuditLogsPage() {
  const [query, setQuery] = useState('');
  const [action, setAction] = useState('');
  const [module, setModule] = useState('');
  const [user, setUser] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const params = useMemo(() => ({
    query,
    action: action || undefined,
    module: module || undefined,
    user: user || undefined,
    page,
    size: 10,
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    status: statusFilter || undefined,
  }), [action, module, page, query, statusFilter, user]);

  const { data, isLoading, isError, refetch } = useAuditLogs(params);
  const { data: statsData } = useAuditStatistics();

  const logs = (data?.content as AuditLogItem[] | undefined) ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Audit logs</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Production audit trail</h2>
            <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">Every successful action is recorded from PostgreSQL-backed audit events.</p>
          </div>
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow-soft dark:bg-slate-900">
          <p className="text-sm text-slate-500">Total audit count</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{statsData?.totalAuditCount ?? 0}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-soft dark:bg-slate-900">
          <p className="text-sm text-slate-500">Today</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{statsData?.todayActions ?? 0}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-soft dark:bg-slate-900">
          <p className="text-sm text-slate-500">Week</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{statsData?.weeklyActions ?? 0}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-soft dark:bg-slate-900">
          <p className="text-sm text-slate-500">Logins</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{statsData?.loginCount ?? 0}</p>
        </div>
      </div>

      <div className="rounded-[32px] bg-white p-6 shadow-soft dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-5">
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Search size={16} />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search logs" className="w-full bg-transparent outline-none" />
          </label>
          <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <option value="">All actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="CREATE_USER">CREATE_USER</option>
            <option value="CREATE_MANAGER">CREATE_MANAGER</option>
            <option value="CREATE_DISPATCHER">CREATE_DISPATCHER</option>
            <option value="ASSIGN_DELIVERY">ASSIGN_DELIVERY</option>
            <option value="CREATE_REQUEST">CREATE_REQUEST</option>
            <option value="DELETE_USER">DELETE_USER</option>
          </select>
          <select value={module} onChange={(e) => { setModule(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <option value="">All modules</option>
            <option value="AUTH">AUTH</option>
            <option value="USER_MANAGEMENT">USER_MANAGEMENT</option>
            <option value="DISPATCH">DISPATCH</option>
            <option value="REQUEST">REQUEST</option>
          </select>
          <input value={user} onChange={(e) => { setUser(e.target.value); setPage(1); }} placeholder="User email/name" className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <option value="">All statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="WARNING">Warning</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="mt-6 overflow-x-auto">
          {isLoading ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading audit logs...
              </div>
            </div>
          ) : isError ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl bg-rose-50 text-center dark:bg-rose-950/20">
              <AlertCircle className="h-8 w-8 text-rose-600" />
              <p className="mt-3 font-semibold text-rose-700">Unable to load audit logs</p>
              <button onClick={() => refetch()} className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white">Retry</button>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center dark:border-slate-700 dark:bg-slate-800">
              <FileText className="h-8 w-8 text-slate-400" />
              <p className="mt-3 font-semibold text-slate-700 dark:text-slate-200">No audit logs found</p>
              <p className="text-sm text-slate-500">No matching PostgreSQL audit entries were returned.</p>
            </div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-3 pr-3">Action</th>
                  <th className="py-3 pr-3">Module</th>
                  <th className="py-3 pr-3">Performed by</th>
                  <th className="py-3 pr-3">Timestamp</th>
                  <th className="py-3 pr-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log: AuditLogItem) => {
                  const statusMeta = getStatusMeta(log.status ?? (log.responseStatus ? String(log.responseStatus) : ''));
                  return (
                    <tr key={log.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setSelectedLog(log)}>
                      <td className="py-3 pr-3 font-medium text-slate-900 dark:text-slate-100">{formatActionLabel(log.action)}</td>
                      <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">{log.module}</td>
                      <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">{log.performedByEmail ?? log.performedByName ?? 'System'}</td>
                      <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">{log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}</td>
                      <td className="py-3 pr-3">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition hover:scale-[1.02] ${statusMeta.className}`}>
                          <span>{statusMeta.icon}</span>
                          <span>{statusMeta.label}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:opacity-50">Previous</button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Audit details</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{formatActionLabel(selectedLog.action)} </h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="rounded-2xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-200"><X size={18} /></button>
            </div>

            <div className="mt-6 rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-700">✔</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500">{formatActionLabel(selectedLog.action)}</p>
                      <h4 className="text-xl font-semibold text-slate-950 dark:text-white">{getWhatHappened(selectedLog)}</h4>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${getStatusMeta(selectedLog.status ?? (selectedLog.responseStatus ? String(selectedLog.responseStatus) : '')).className}`}>
                    <span>{getStatusMeta(selectedLog.status ?? (selectedLog.responseStatus ? String(selectedLog.responseStatus) : '')).icon}</span>
                    <span>{getStatusMeta(selectedLog.status ?? (selectedLog.responseStatus ? String(selectedLog.responseStatus) : '')).label}</span>
                  </span>
                  <p className="text-sm text-slate-500">Time {formatTimeOnly(selectedLog.createdAt)}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl bg-white/80 p-4 shadow-sm dark:bg-slate-800/70">
                  <p className="text-sm text-slate-500">Status</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{getStatusMeta(selectedLog.status ?? (selectedLog.responseStatus ? String(selectedLog.responseStatus) : '')).label}</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4 shadow-sm dark:bg-slate-800/70">
                  <p className="text-sm text-slate-500">Action</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{formatActionLabel(selectedLog.action)}</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4 shadow-sm dark:bg-slate-800/70">
                  <p className="text-sm text-slate-500">Date & Time</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{formatTimestamp(selectedLog.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <h4 className="text-lg font-semibold text-slate-950 dark:text-white">Who performed the action</h4>
                  <div className="mt-4 flex items-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white dark:bg-slate-700">
                      {(getDisplayName(selectedLog).charAt(0) || 'U').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-white">{getDisplayName(selectedLog)}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{selectedLog.role || 'System'}</p>
                      <p className="text-sm text-slate-500">{selectedLog.performedByEmail || 'No email available'}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <h4 className="text-lg font-semibold text-slate-950 dark:text-white">What happened</h4>
                  <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{getWhatHappened(selectedLog)}</p>
                </section>

                <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <h4 className="text-lg font-semibold text-slate-950 dark:text-white">Why</h4>
                  <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{getReason(selectedLog)}</p>
                </section>

                <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <h4 className="text-lg font-semibold text-slate-950 dark:text-white">Affected record</h4>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                      <p className="text-sm text-slate-500">Entity Type</p>
                      <p className="mt-2 font-semibold text-slate-950 dark:text-white">{getAffectedRecord(selectedLog).entityLabel}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                      <p className="text-sm text-slate-500">Entity Name</p>
                      <p className="mt-2 font-semibold text-slate-950 dark:text-white">{getAffectedRecord(selectedLog).entityName}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <h4 className="text-lg font-semibold text-slate-950 dark:text-white">What changed</h4>
                  {getChangeRows(selectedLog).length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {getChangeRows(selectedLog).map((row: { label: string; oldValue: unknown; newValue: unknown }, index: number) => (
                        <div key={`${row.label}-${index}`} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{row.label}</p>
                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30">
                              <p className="font-semibold">Before</p>
                              <p className="mt-1">{String(row.oldValue ?? '—')}</p>
                            </div>
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30">
                              <p className="font-semibold">After</p>
                              <p className="mt-1">{String(row.newValue ?? '—')}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">No change details were captured for this event.</p>
                  )}
                </section>
              </div>

              <div className="space-y-6">
                <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <h4 className="text-lg font-semibold text-slate-950 dark:text-white">Business impact</h4>
                  <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{getBusinessImpact(selectedLog)}</p>
                </section>

                <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <h4 className="text-lg font-semibold text-slate-950 dark:text-white">Status</h4>
                  <div className="mt-4 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${getStatusMeta(selectedLog.status ?? (selectedLog.responseStatus ? String(selectedLog.responseStatus) : '')).className}`}>
                      <span>{getStatusMeta(selectedLog.status ?? (selectedLog.responseStatus ? String(selectedLog.responseStatus) : '')).icon}</span>
                      <span>{getStatusMeta(selectedLog.status ?? (selectedLog.responseStatus ? String(selectedLog.responseStatus) : '')).label}</span>
                    </span>
                  </div>
                </section>

                <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <h4 className="text-lg font-semibold text-slate-950 dark:text-white">Timeline</h4>
                  <div className="mt-4 space-y-4">
                    {[
                      { title: 'Created', time: formatTimeOnly(selectedLog.createdAt) },
                      { title: 'Processed', time: formatTimeOnly(selectedLog.createdAt) },
                      { title: 'Completed', time: formatTimeOnly(selectedLog.createdAt) },
                    ].map((item) => (
                      <div key={item.title} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                          <p className="text-sm text-slate-500">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <button onClick={() => setShowTechnicalDetails((prev) => !prev)} className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                    <span>Technical Details</span>
                    {showTechnicalDetails ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  {showTechnicalDetails && (
                    <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      <div className="flex items-center justify-between gap-4"><span className="text-slate-500">HTTP Status</span><span className="font-semibold">{selectedLog.responseStatus ?? '—'}</span></div>
                      <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Request URL</span><span className="font-semibold">{selectedLog.endpoint ?? '—'}</span></div>
                      <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Browser</span><span className="font-semibold">{selectedLog.browser ?? '—'}</span></div>
                      <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Operating System</span><span className="font-semibold">{selectedLog.operatingSystem ?? '—'}</span></div>
                      <div className="flex items-center justify-between gap-4"><span className="text-slate-500">IP Address</span><span className="font-semibold">{selectedLog.ipAddress ?? '—'}</span></div>
                      <div className="flex items-center justify-between gap-4"><span className="text-slate-500">HTTP Method</span><span className="font-semibold">{selectedLog.httpMethod ?? '—'}</span></div>
                      <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Request ID</span><span className="font-semibold">—</span></div>
                      <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Trace ID</span><span className="font-semibold">—</span></div>
                      <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Database ID</span><span className="font-semibold">{selectedLog.id}</span></div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
