export const APP_NAME = 'PlaceHub';
export const APP_DESCRIPTION = 'Placement Management Portal';

export const ROLES = {
  ADMIN: 'ADMIN',
  PLACEMENT_OFFICER: 'PLACEMENT_OFFICER',
  RECRUITER: 'RECRUITER',
  STUDENT: 'STUDENT',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<RoleType, string> = {
  ADMIN: 'Admin',
  PLACEMENT_OFFICER: 'Placement Officer',
  RECRUITER: 'Recruiter',
  STUDENT: 'Student',
};

export const ROLE_DASHBOARD_ROUTES: Record<RoleType, string> = {
  ADMIN: '/admin/dashboard',
  PLACEMENT_OFFICER: '/placement/dashboard',
  RECRUITER: '/recruiter/dashboard',
  STUDENT: '/student/dashboard',
};

export const APPLICATION_STATUS = {
  APPLIED: 'APPLIED',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEWING: 'INTERVIEWING',
  SELECTED: 'SELECTED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
} as const;

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  APPLIED: 'Applied',
  SHORTLISTED: 'Shortlisted',
  INTERVIEWING: 'Interviewing',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

export const JOB_STATUS = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  FILLED: 'FILLED',
} as const;

export const DRIVE_STATUS = {
  UPCOMING: 'UPCOMING',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const PROFILE_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const;

export const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Electrical',
  'Mechanical',
  'Civil',
  'Chemical',
  'Biotechnology',
  'Mathematics',
  'Physics',
] as const;

export type DepartmentType = (typeof DEPARTMENTS)[number];
