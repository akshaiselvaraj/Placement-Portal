import { api } from '@/lib/axios';
import type { ApiResponse, User, Company } from '@/types';

export interface ExtensionUserItem {
  id: string;
  fullName: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  consentAccepted: boolean;
  consentTimestamp: string;
  extensionVersion: string;
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
  activityLogs?: ExtensionActivityItem[];
}

export interface ExtensionActivityItem {
  id: string;
  userId: string;
  activityType: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  user?: ExtensionUserItem;
}

export interface DashboardStatsData {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  recentActivityCount: number;
  recentActivity: ExtensionActivityItem[];
}

export const adminService = {
  getUsers: async (params?: Record<string, any>): Promise<User[]> => {
    const res = await api.get<ApiResponse<User[]>>('/admin/users', { params });
    return res.data.data;
  },

  toggleUserStatus: async (id: string, isActive: boolean): Promise<User> => {
    const res = await api.put<ApiResponse<User>>(`/admin/users/${id}/status`, { isActive });
    return res.data.data;
  },

  getCompanies: async (): Promise<Company[]> => {
    const res = await api.get<ApiResponse<Company[]>>('/admin/companies');
    return res.data.data;
  },

  createCompany: async (data: Record<string, any>): Promise<Company> => {
    const res = await api.post<ApiResponse<Company>>('/admin/companies', data);
    return res.data.data;
  },

  updateCompany: async (id: string, data: Record<string, any>): Promise<Company> => {
    const res = await api.put<ApiResponse<Company>>(`/admin/companies/${id}`, data);
    return res.data.data;
  },

  // Extension Users & System Activity Services
  getExtensionUsers: async (params?: Record<string, any>): Promise<{
    users: ExtensionUserItem[];
    pagination: { total: number; page: number; totalPages: number };
  }> => {
    const res = await api.get<ApiResponse<ExtensionUserItem[]>>('/users', { params });
    return {
      users: res.data.data || [],
      pagination: (res.data as any).pagination || { total: 0, page: 1, totalPages: 1 },
    };
  },

  getExtensionUserById: async (id: string): Promise<ExtensionUserItem> => {
    const res = await api.get<ApiResponse<ExtensionUserItem>>(`/users/${id}`);
    return res.data.data;
  },

  updateExtensionUserStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<ExtensionUserItem> => {
    const res = await api.put<ApiResponse<ExtensionUserItem>>(`/users/${id}`, { status });
    return res.data.data;
  },

  getDashboardStats: async (): Promise<DashboardStatsData> => {
    const res = await api.get<ApiResponse<DashboardStatsData>>('/dashboard/stats');
    return res.data.data;
  },

  getActivityLogs: async (params?: Record<string, any>): Promise<{
    logs: ExtensionActivityItem[];
    pagination: { total: number; page: number; totalPages: number };
  }> => {
    const res = await api.get<ApiResponse<ExtensionActivityItem[]>>('/activity', { params });
    return {
      logs: res.data.data || [],
      pagination: (res.data as any).pagination || { total: 0, page: 1, totalPages: 1 },
    };
  },
};

export default adminService;
