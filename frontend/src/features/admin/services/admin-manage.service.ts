import { api } from '@/lib/axios';
import type { ApiResponse, Admin, AdminActivityLog } from '@/types';

export interface AdminListFilters {
  search?: string;
  role?: string;
  status?: string;
  department?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AdminListResponse {
  admins: Admin[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminStatsResponse {
  total: number;
  active: number;
  superAdmins: number;
  disabled: number;
  lastLogin: string | null;
  pendingInvitations: number;
}

export const adminManageService = {
  getStats: async (): Promise<AdminStatsResponse> => {
    const res = await api.get<ApiResponse<AdminStatsResponse>>('/admins/stats');
    return res.data.data;
  },

  listAdmins: async (params?: AdminListFilters): Promise<AdminListResponse> => {
    const res = await api.get<ApiResponse<AdminListResponse>>('/admins', { params });
    return res.data.data;
  },

  getAdmin: async (id: string): Promise<Admin> => {
    const res = await api.get<ApiResponse<Admin>>(`/admins/${id}`);
    return res.data.data;
  },

  createAdmin: async (data: Record<string, any>): Promise<Admin> => {
    const res = await api.post<ApiResponse<Admin>>('/admins', data);
    return res.data.data;
  },

  updateAdmin: async (id: string, data: Record<string, any>): Promise<Admin> => {
    const res = await api.put<ApiResponse<Admin>>(`/admins/${id}`, data);
    return res.data.data;
  },

  deleteAdmin: async (id: string): Promise<void> => {
    await api.delete(`/admins/${id}`);
  },

  restoreAdmin: async (id: string): Promise<void> => {
    await api.post(`/admins/${id}/restore`);
  },

  updateStatus: async (id: string, status: string): Promise<Admin> => {
    const res = await api.patch<ApiResponse<Admin>>('/admins/status', { id, status });
    return res.data.data;
  },

  updatePermissions: async (id: string, permissions: string[]): Promise<void> => {
    await api.patch('/admins/permissions', { id, permissions });
  },

  getActivities: async (params?: { adminId?: string; action?: string; limit?: number }): Promise<AdminActivityLog[]> => {
    const res = await api.get<ApiResponse<AdminActivityLog[]>>('/admins/activity', { params });
    return res.data.data;
  },
};

export default adminManageService;
