import { api } from '@/lib/axios';
import type { ApiResponse, Company, Application } from '@/types';

export interface RecruiterDashboardData {
  stats: {
    totalApplicants: number;
    underReviewCount: number;
    shortlistedCount: number;
    inInterviewCount: number;
    selectedCount: number;
    hiredCount: number;
    rejectedCount: number;
    activeJobsCount: number;
    closedJobsCount: number;
  };
  recentApplications: RecentApplication[];
}

export interface RecentApplication {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string | null;
  jobTitle: string;
  jobId: string;
  appliedAt: string;
  status: string;
  atsScore: number;
  atsBreakdown: AtsBreakdown | null;
}

export interface AtsBreakdown {
  score: number;
  weights: { skills: number; education: number; cgpa: number; experience: number; certifications: number; projects: number };
  scores: { skillsScore: number; educationScore: number; cgpaScore: number; experienceScore: number; certificationsScore: number; projectsScore: number };
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
}

export interface CandidateDetails {
  id: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  atsScore: number;
  atsBreakdown: AtsBreakdown;
  hiredAt: string | null;
  joiningDate: string | null;
  offerStatus: string | null;
  job: {
    id: string;
    title: string;
    requiredSkills: string[];
    preferredSkills: string[];
    minCgpa: number | null;
    minActivityPoints?: number | null;
    eligibleDepartments: string[];
    eligibleGradYears: number[];
  };
  student: {
    id: string;
    department: string;
    batch: string;
    cgpa: number | null;
    tenthMarks?: number | null;
    twelfthMarks?: number | null;
    activityPoints?: number | null;
    phone: string | null;
    bio: string | null;
    linkedin: string | null;
    github: string | null;
    website: string | null;
    user: { id: string; name: string; email: string; avatar: string | null };
    educations: Education[];
    projects: Project[];
    skills: Skill[];
    certifications: Certification[];
    resumes: Resume[];
    portfolios: Portfolio[];
  };
  interviews: Interview[];
  statusHistory: StatusHistory[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number | null;
  grade: string | null;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  liveUrl: string | null;
  repoUrl: string | null;
}

export interface Skill {
  id: string;
  name: string;
  level: string | null;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string | null;
  url: string | null;
}

export interface Resume {
  id: string;
  title: string;
  templateId: string;
  isApproved: boolean;
  createdAt: string;
  data: Record<string, any>;
}

export interface Portfolio {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  themeId: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  date: string;
  time: string | null;
  duration: number | null;
  interviewer: string | null;
  meetingLink: string | null;
  roundType: string | null;
  location: string | null;
  status: string;
  result: string | null;
  feedback: string | null;
  notes: string | null;
  createdAt: string;
  application?: {
    job: { id: string; title: string };
    student: { user: { name: string; email: string; avatar: string | null } };
  };
}

export interface StatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ApplicantFilters {
  jobId?: string;
  status?: string;
  search?: string;
  department?: string;
  gradYear?: string;
  minCgpa?: string;
  maxCgpa?: string;
  minAts?: string;
  maxAts?: string;
}

export interface ScheduleInterviewPayload {
  applicationId: string;
  date: string;
  time?: string;
  duration?: number;
  interviewer?: string;
  meetingLink?: string;
  roundType?: string;
  location?: string;
  notes?: string;
}

export interface UpdateInterviewPayload {
  status?: string;
  result?: 'PENDING' | 'PASSED' | 'FAILED';
  feedback?: string;
  notes?: string;
  date?: string;
  time?: string;
  interviewer?: string;
  meetingLink?: string;
}

export const recruiterService = {
  getDashboard: async (): Promise<RecruiterDashboardData> => {
    const res = await api.get<ApiResponse<RecruiterDashboardData>>('/recruiters/dashboard');
    return res.data.data;
  },

  getProfile: async () => {
    const res = await api.get('/recruiters/profile');
    return res.data.data;
  },

  updateProfile: async (data: Record<string, any>) => {
    const res = await api.put('/recruiters/profile', data);
    return res.data.data;
  },

  getCompany: async (): Promise<Company> => {
    const res = await api.get<ApiResponse<Company>>('/recruiters/company');
    return res.data.data;
  },

  getApplicants: async (filters?: ApplicantFilters): Promise<CandidateDetails[]> => {
    const res = await api.get<ApiResponse<CandidateDetails[]>>('/recruiters/applicants', { params: filters });
    return res.data.data;
  },

  getCandidateDetails: async (applicationId: string): Promise<CandidateDetails> => {
    const res = await api.get<ApiResponse<CandidateDetails>>(`/recruiters/applicants/${applicationId}`);
    return res.data.data;
  },

  updateApplicantStatus: async (id: string, data: { status: string; notes?: string; joiningDate?: string; offerStatus?: string }): Promise<Application> => {
    const res = await api.put<ApiResponse<Application>>(`/recruiters/applicants/${id}/status`, data);
    return res.data.data;
  },

  searchCandidates: async (query: string) => {
    const res = await api.get('/recruiters/candidates/search', { params: { q: query } });
    return res.data.data;
  },

  scheduleInterview: async (data: ScheduleInterviewPayload): Promise<Interview> => {
    const res = await api.post<ApiResponse<Interview>>('/recruiters/interviews', data);
    return res.data.data;
  },

  getInterviews: async (status?: string): Promise<Interview[]> => {
    const res = await api.get<ApiResponse<Interview[]>>('/recruiters/interviews', { params: status ? { status } : {} });
    return res.data.data;
  },

  updateInterview: async (id: string, data: UpdateInterviewPayload): Promise<Interview> => {
    const res = await api.put<ApiResponse<Interview>>(`/recruiters/interviews/${id}`, data);
    return res.data.data;
  },

  getHiringHistory: async (): Promise<CandidateDetails[]> => {
    const res = await api.get<ApiResponse<CandidateDetails[]>>('/recruiters/hiring-history');
    return res.data.data;
  },
};

export default recruiterService;
