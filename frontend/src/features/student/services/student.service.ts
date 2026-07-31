import { api } from '@/lib/axios';
import type { ApiResponse, StudentProfile, Education, Project, Skill, Certification } from '@/types';

export const studentService = {
  getProfile: async (): Promise<StudentProfile> => {
    const res = await api.get<ApiResponse<StudentProfile>>('/students/profile');
    return res.data.data;
  },

  updateProfile: async (data: Record<string, any>): Promise<StudentProfile> => {
    const res = await api.put<ApiResponse<StudentProfile>>('/students/profile', data);
    return res.data.data;
  },

  // --- Education ---
  addEducation: async (data: Record<string, any>): Promise<Education> => {
    const res = await api.post<ApiResponse<Education>>('/students/education', data);
    return res.data.data;
  },

  updateEducation: async (id: string, data: Record<string, any>): Promise<Education> => {
    const res = await api.put<ApiResponse<Education>>(`/students/education/${id}`, data);
    return res.data.data;
  },

  deleteEducation: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/students/education/${id}`);
  },

  // --- Projects ---
  addProject: async (data: Record<string, any>): Promise<Project> => {
    const res = await api.post<ApiResponse<Project>>('/students/projects', data);
    return res.data.data;
  },

  updateProject: async (id: string, data: Record<string, any>): Promise<Project> => {
    const res = await api.put<ApiResponse<Project>>(`/students/projects/${id}`, data);
    return res.data.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/students/projects/${id}`);
  },

  // --- Skills ---
  addSkill: async (data: Record<string, any>): Promise<Skill> => {
    const res = await api.post<ApiResponse<Skill>>('/students/skills', data);
    return res.data.data;
  },

  deleteSkill: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/students/skills/${id}`);
  },

  // --- Certifications ---
  addCertification: async (data: Record<string, any>): Promise<Certification> => {
    const res = await api.post<ApiResponse<Certification>>('/students/certifications', data);
    return res.data.data;
  },

  updateCertification: async (id: string, data: Record<string, any>): Promise<Certification> => {
    const res = await api.put<ApiResponse<Certification>>(`/students/certifications/${id}`, data);
    return res.data.data;
  },

  deleteCertification: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/students/certifications/${id}`);
  },
};

export default studentService;
