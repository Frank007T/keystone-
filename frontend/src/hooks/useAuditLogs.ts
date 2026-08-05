import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs, fetchAuditStatistics } from '../lib/api';
import type { AuditLogResponse } from '../types/audit';

export function useAuditLogs(params: Record<string, unknown> = {}) {
  return useQuery<AuditLogResponse>({
    queryKey: ['audit-logs', params],
    queryFn: () => fetchAuditLogs(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAuditStatistics() {
  return useQuery({
    queryKey: ['audit-statistics'],
    queryFn: fetchAuditStatistics,
  });
}
