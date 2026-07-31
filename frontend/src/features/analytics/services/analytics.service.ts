import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types';

export const analyticsService = {
  getDashboardStats: async (params?: { department?: string; batch?: string }): Promise<any> => {
    const res = await api.get<ApiResponse<any>>('/analytics/dashboard', { params });
    return res.data.data;
  },

  getOfficerReport: async (params?: { department?: string; batch?: string }): Promise<any> => {
    const res = await api.get<ApiResponse<any>>('/analytics/officer-report', { params });
    return res.data.data;
  },
};

export default analyticsService;
