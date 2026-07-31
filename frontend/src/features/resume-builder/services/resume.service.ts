import { api } from '@/lib/axios';
import type { ApiResponse, Resume } from '@/types';

export const resumeService = {
  getResumes: async (): Promise<Resume[]> => {
    const res = await api.get<ApiResponse<Resume[]>>('/resumes');
    return res.data.data;
  },

  getResumeById: async (id: string): Promise<Resume> => {
    const res = await api.get<ApiResponse<Resume>>(`/resumes/${id}`);
    return res.data.data;
  },

  createResume: async (data: { templateId: string; title: string; data: Record<string, any> }): Promise<Resume> => {
    const res = await api.post<ApiResponse<Resume>>('/resumes', data);
    return res.data.data;
  },

  updateResume: async (id: string, data: { templateId?: string; title?: string; data?: Record<string, any> }): Promise<Resume> => {
    const res = await api.put<ApiResponse<Resume>>(`/resumes/${id}`, data);
    return res.data.data;
  },

  deleteResume: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/resumes/${id}`);
  },
};

export default resumeService;
