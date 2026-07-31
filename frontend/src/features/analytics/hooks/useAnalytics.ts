import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';

export function useDashboardStats(params?: { department?: string; batch?: string }) {
  return useQuery({
    queryKey: ['analyticsDashboard', params],
    queryFn: () => analyticsService.getDashboardStats(params),
  });
}

export function useOfficerReport(params?: { department?: string; batch?: string }) {
  return useQuery({
    queryKey: ['analyticsOfficerReport', params],
    queryFn: () => analyticsService.getOfficerReport(params),
  });
}
