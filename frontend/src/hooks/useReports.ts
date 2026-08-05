import { useQuery } from '@tanstack/react-query';
import {
  fetchDashboardReport,
  fetchRequestSummary,
  fetchRevenueReport,
  fetchManagerPerformance,
  fetchTeamAllocation,
  fetchSlaHealth,
  fetchZoneAnalytics,
} from '../lib/api';

export function useDashboardReport(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['dashboard-report', params],
    queryFn: () => fetchDashboardReport(params),
  });
}

export function useRequestSummary(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['request-summary', params],
    queryFn: () => fetchRequestSummary(params),
  });
}

export function useRevenueReport(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['revenue-report', params],
    queryFn: () => fetchRevenueReport(params),
  });
}

export function useManagerPerformance(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['manager-performance', params],
    queryFn: () => fetchManagerPerformance(params),
  });
}

export function useTeamAllocation(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['team-allocation', params],
    queryFn: () => fetchTeamAllocation(params),
  });
}

export function useSlaHealth(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['sla-health', params],
    queryFn: () => fetchSlaHealth(params),
  });
}

export function useZoneAnalytics(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['zone-analytics', params],
    queryFn: () => fetchZoneAnalytics(params),
  });
}
