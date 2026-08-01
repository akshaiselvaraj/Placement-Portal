export type { RoleType, DepartmentType } from '../lib/constants';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  rollNumber: string;
  department: string;
  batch: string;
  cgpa: number | null;
  phone: string | null;
  bio: string | null;
  profileStatus: string;
  linkedin: string | null;
  github: string | null;
  website: string | null;
  user?: User;
  educations?: Education[];
  projects?: Project[];
  skills?: Skill[];
  certifications?: Certification[];
  resumes?: Resume[];
  portfolios?: Portfolio[];
  applications?: Application[];
}

export interface RecruiterProfile {
  id: string;
  userId: string;
  companyId: string;
  designation: string | null;
  phone: string | null;
  user?: User;
  company?: Company;
}

export interface PlacementOfficerProfile {
  id: string;
  userId: string;
  department: string;
  designation: string | null;
  user?: User;
}

export interface Company {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
  industry: string | null;
  description: string | null;
  location: string | null;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  companyId: string;
  type: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  deadline: string;
  status: string;
  eligibility: string | null;
  requirements: string | null;
  postedBy: string;
  company?: Company;
  createdAt: string;
  _count?: {
    applications: number;
  };
}

export interface Application {
  id: string;
  studentId: string;
  jobId: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  student?: StudentProfile;
  job?: Job;
}

export interface PlacementDrive {
  id: string;
  title: string;
  description: string | null;
  companyId: string;
  status: string;
  eligibilityCriteria: string | null;
  startDate: string;
  endDate: string | null;
  company?: Company;
  createdAt: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  driveId: string | null;
  date: string;
  type: string;
  location: string | null;
  status: string;
  notes: string | null;
  application?: Application;
  drive?: PlacementDrive;
}

export interface Education {
  id: string;
  studentId: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number | null;
  grade: string | null;
}

export interface Project {
  id: string;
  studentId: string;
  title: string;
  description: string;
  techStack: string[];
  liveUrl: string | null;
  repoUrl: string | null;
}

export interface Skill {
  id: string;
  studentId: string;
  name: string;
  level: string | null;
}

export interface Certification {
  id: string;
  studentId: string;
  name: string;
  issuer: string;
  date: string | null;
  url: string | null;
}

export interface Resume {
  id: string;
  studentId: string;
  templateId: string;
  title: string;
  data: Record<string, unknown>;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Portfolio {
  id: string;
  studentId: string;
  themeId: string;
  title: string;
  data: Record<string, unknown>;
  slug: string;
  isPublished: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}
