import { api } from '@/lib/axios';
import type { ApiResponse, StudentProfile, Resume, Portfolio, Application, Interview, Company, PlacementDrive } from '@/types';

export const placementService = {
  // Placement Drives
  getDrives: async (params?: Record<string, any>): Promise<PlacementDrive[]> => {
    const res = await api.get<ApiResponse<PlacementDrive[]>>('/placement/drives', { params });
    return res.data.data;
  },

  getDriveStats: async (): Promise<any> => {
    const res = await api.get<ApiResponse<any>>('/placement/drives/stats');
    return res.data.data;
  },

  getDriveById: async (id: string): Promise<PlacementDrive> => {
    const res = await api.get<ApiResponse<PlacementDrive>>(`/placement/drives/${id}`);
    return res.data.data;
  },

  createDrive: async (data: Record<string, any>): Promise<PlacementDrive> => {
    const res = await api.post<ApiResponse<PlacementDrive>>('/placement/drives', data);
    return res.data.data;
  },

  updateDrive: async (id: string, data: Record<string, any>): Promise<PlacementDrive> => {
    const res = await api.put<ApiResponse<PlacementDrive>>(`/placement/drives/${id}`, data);
    return res.data.data;
  },

  deleteDrive: async (id: string): Promise<void> => {
    await api.delete(`/placement/drives/${id}`);
  },

  duplicateDrive: async (id: string): Promise<PlacementDrive> => {
    const res = await api.post<ApiResponse<PlacementDrive>>(`/placement/drives/${id}/duplicate`);
    return res.data.data;
  },

  bulkArchiveDrives: async (ids: string[]): Promise<void> => {
    await api.post('/placement/drives/bulk-archive', { ids });
  },

  bulkDeleteDrives: async (ids: string[]): Promise<void> => {
    await api.post('/placement/drives/bulk-delete', { ids });
  },

  evaluateEligibility: async (id: string): Promise<{ eligible: any[]; notEligible: any[] }> => {
    const res = await api.get<ApiResponse<{ eligible: any[]; notEligible: any[] }>>(`/placement/drives/${id}/eligibility`);
    return res.data.data;
  },

  // Companies Management
  getCompanies: async (params?: Record<string, any>): Promise<Company[]> => {
    const res = await api.get<ApiResponse<Company[]>>('/placement/companies', { params });
    return res.data.data;
  },

  createCompany: async (data: Record<string, any>): Promise<Company> => {
    const res = await api.post<ApiResponse<Company>>('/placement/companies', data);
    return res.data.data;
  },

  updateCompany: async (id: string, data: Record<string, any>): Promise<Company> => {
    const res = await api.put<ApiResponse<Company>>(`/placement/companies/${id}`, data);
    return res.data.data;
  },

  deleteCompany: async (id: string): Promise<void> => {
    await api.delete(`/placement/companies/${id}`);
  },

  // Recruiters
  getRecruiters: async (): Promise<any[]> => {
    const res = await api.get<ApiResponse<any[]>>('/placement/recruiters');
    return res.data.data;
  },

  // Applications
  bulkUpdateApplications: async (ids: string[], status: string): Promise<void> => {
    await api.post('/placement/applications/bulk-update', { ids, status });
  },

  // Interview Management
  getInterviews: async (): Promise<Interview[]> => {
    const res = await api.get<ApiResponse<Interview[]>>('/placement/interviews');
    return res.data.data;
  },

  updateInterview: async (id: string, data: Record<string, any>): Promise<Interview> => {
    const res = await api.put<ApiResponse<Interview>>(`/placement/interviews/${id}`, data);
    return res.data.data;
  },

  // Results Management
  getResults: async (): Promise<Application[]> => {
    const res = await api.get<ApiResponse<Application[]>>('/placement/results');
    return res.data.data;
  },

  updateOfferResult: async (id: string, data: Record<string, any>): Promise<Application> => {
    const res = await api.put<ApiResponse<Application>>(`/placement/results/${id}`, data);
    return res.data.data;
  },

  bulkPublishResults: async (ids: string[]): Promise<void> => {
    await api.post('/placement/results/bulk-publish', { ids });
  },

  // Document Center
  getDocuments: async (): Promise<any[]> => {
    const res = await api.get<ApiResponse<any[]>>('/placement/documents');
    return res.data.data;
  },

  approveDocument: async (id: string, data: { status: string; comments?: string }): Promise<any> => {
    const res = await api.put<ApiResponse<any>>(`/placement/documents/${id}/approve`, data);
    return res.data.data;
  },

  // Baseline legacy verification components
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
