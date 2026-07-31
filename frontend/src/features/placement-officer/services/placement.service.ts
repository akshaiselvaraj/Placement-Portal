import { api } from '@/lib/axios';
import type { ApiResponse, StudentProfile, Resume, Portfolio, Application, Interview } from '@/types';

export const placementService = {
  getStudents: async (params?: Record<string, any>): Promise<StudentProfile[]> => {
    const res = await api.get<ApiResponse<StudentProfile[]>>('/placement/students', { params });
    return res.data.data;
  },

  verifyStudent: async (id: string, status: string): Promise<StudentProfile> => {
    const res = await api.put<ApiResponse<StudentProfile>>(`/placement/students/${id}/verify`, { status });
    return res.data.data;
  },

  getResumes: async (): Promise<Resume[]> => {
    const res = await api.get<ApiResponse<Resume[]>>('/placement/resumes');
    return res.data.data;
  },

  approveResume: async (id: string, isApproved: boolean): Promise<Resume> => {
    const res = await api.put<ApiResponse<Resume>>(`/placement/resumes/${id}/approve`, { isApproved });
    return res.data.data;
  },

  getPortfolios: async (): Promise<Portfolio[]> => {
    const res = await api.get<ApiResponse<Portfolio[]>>('/placement/portfolios');
    return res.data.data;
  },

  approvePortfolio: async (id: string, isApproved: boolean): Promise<Portfolio> => {
    const res = await api.put<ApiResponse<Portfolio>>(`/placement/portfolios/${id}/approve`, { isApproved });
    return res.data.data;
  },

  getApplications: async (): Promise<Application[]> => {
    const res = await api.get<ApiResponse<Application[]>>('/placement/applications');
    return res.data.data;
  },

  scheduleInterview: async (data: {
    applicationId: string;
    driveId: string;
    date: string;
    type: string;
    location: string;
  }): Promise<Interview> => {
    const res = await api.post<ApiResponse<Interview>>('/placement/interviews', data);
    return res.data.data;
  },

  publishResult: async (data: {
    applicationId: string;
    status: string;
  }): Promise<Application> => {
    const res = await api.post<ApiResponse<Application>>('/placement/results', data);
    return res.data.data;
  },
};

export default placementService;
