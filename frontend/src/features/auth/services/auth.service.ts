import { api } from '@/lib/axios';
import type { ApiResponse, AuthResponse, User } from '@/types';

export const authService = {
  login: async (data: Record<string, string>): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data;
  },

  register: async (data: Record<string, unknown>): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data;
  },

  me: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  changePassword: async (data: Record<string, string>): Promise<void> => {
    await api.post<ApiResponse<null>>('/auth/change-password', data);
  },
};

export default authService;
