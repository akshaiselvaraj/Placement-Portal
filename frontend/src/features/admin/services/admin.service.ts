import { api } from '@/lib/axios';
import type { ApiResponse, User, Company } from '@/types';

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
};

export default adminService;
