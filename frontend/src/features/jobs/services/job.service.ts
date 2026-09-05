import { api } from '@/lib/axios';
import type { ApiResponse, Job, Application } from '@/types';

export interface CreateJobPayload {
  title: string;
  description: string;
  companyId: string;
  type: string;
  location: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  deadline: string;
  status?: string;
  eligibility?: string | null;
  requirements?: string | null;
  minCgpa?: number | null;
  minActivityPoints?: number | null;
  minPsLevel?: string | null;
  min10thMarks?: number | null;
  min12thMarks?: number | null;
}

export interface EligibilityResult {
  eligible: boolean;
  studentCgpa: number | null;
  requiredCgpa: number;
  studentActivityPoints?: number;
  requiredActivityPoints?: number;
  profileVerified: boolean;
  atsScore?: number;
  studentPsLevel?: string | null;
  requiredPsLevel?: string | null;
  student10thMarks?: number | null;
  required10thMarks?: number | null;
  student12thMarks?: number | null;
  required12thMarks?: number | null;
  atsBreakdown?: {
    score: number;
    weights: {
      skills: number;
      education: number;
      cgpa: number;
      experience: number;
      certifications: number;
      projects: number;
    };
    scores: {
      skillsScore: number;
      educationScore: number;
      cgpaScore: number;
      experienceScore: number;
      certificationsScore: number;
      projectsScore: number;
    };
    matchedSkills: string[];
    missingSkills: string[];
    eligibility: {
      departmentEligible: boolean;
      gradYearEligible: boolean;
      cgpaEligible: boolean;
      activityPointsEligible: boolean;
      psLevelEligible?: boolean;
      tenthMarksEligible?: boolean;
      twelfthMarksEligible?: boolean;
    };
    explanations: string[];
    aiPlagiarismScore?: number;
    aiPlagiarismReport?: {
      score: number;
      flaggedPhrases: string[];
      explanation: string;
    };
  };
}

export const jobService = {
  // ── Public / Student ──────────────────────────
  getPublicJobs: async (params?: { search?: string; type?: string }): Promise<Job[]> => {
    const res = await api.get<ApiResponse<Job[]>>('/jobs/public', { params });
    return res.data.data;
  },

  getJobById: async (id: string): Promise<Job> => {
    const res = await api.get<ApiResponse<Job>>(`/jobs/public/${id}`);
    return res.data.data;
  },

  checkEligibility: async (jobId: string): Promise<EligibilityResult> => {
    const res = await api.get<ApiResponse<EligibilityResult>>(`/jobs/eligibility/${jobId}`);
    return res.data.data;
  },

  applyToJob: async (jobId: string): Promise<Application> => {
    const res = await api.post<ApiResponse<Application>>(`/jobs/apply/${jobId}`);
    return res.data.data;
  },

  getStudentApplications: async (): Promise<Application[]> => {
    const res = await api.get<ApiResponse<Application[]>>('/jobs/applications');
    return res.data.data;
  },

  withdrawApplication: async (applicationId: string): Promise<Application> => {
    const res = await api.put<ApiResponse<Application>>(`/jobs/applications/${applicationId}/withdraw`);
    return res.data.data;
  },

  // ── Recruiter ─────────────────────────────────
  getRecruiterJobs: async (params?: { status?: string; search?: string; type?: string }): Promise<Job[]> => {
    const res = await api.get<ApiResponse<Job[]>>('/jobs/recruiter', { params });
    return res.data.data;
  },

  createJob: async (data: CreateJobPayload): Promise<Job> => {
    const res = await api.post<ApiResponse<Job>>('/jobs', data);
    return res.data.data;
  },

  updateJob: async (id: string, data: Partial<CreateJobPayload>): Promise<Job> => {
    const res = await api.put<ApiResponse<Job>>(`/jobs/${id}`, data);
    return res.data.data;
  },

  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  },
};

export default jobService;
