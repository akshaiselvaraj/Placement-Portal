import { api } from '@/lib/axios';
import type { ApiResponse, RecruiterProfile, Company, Application } from '@/types';

export const recruiterService = {
  getProfile: async (): Promise<RecruiterProfile> => {
    const res = await api.get<ApiResponse<RecruiterProfile>>('/recruiters/profile');
    return res.data.data;
  },

  updateProfile: async (data: Record<string, any>): Promise<RecruiterProfile> => {
    const res = await api.put<ApiResponse<RecruiterProfile>>('/recruiters/profile', data);
    return res.data.data;
  },

  getCompany: async (): Promise<Company> => {
    const res = await api.get<ApiResponse<Company>>('/recruiters/company');
    return res.data.data;
  },

  getApplicants: async (params?: { jobId?: string; status?: string }): Promise<Application[]> => {
    const res = await api.get<ApiResponse<Application[]>>('/recruiters/applicants', { params });
    return res.data.data;
  },

  updateApplicantStatus: async (id: string, status: string): Promise<Application> => {
    const res = await api.put<ApiResponse<Application>>(`/recruiters/applicants/${id}/status`, { status });
    return res.data.data;
  },
};

export default recruiterService;
