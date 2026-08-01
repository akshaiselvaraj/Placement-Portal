import { z } from 'zod';
import { ApplicationStatus, InterviewStatus } from '@prisma/client';

export const updateRecruiterProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  designation: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  company: z
    .object({
      name: z.string().min(2, 'Company name is required').optional(),
      logo: z.string().nullable().optional(),
      website: z.string().url('Invalid website URL').or(z.literal('')).nullable().optional(),
      industry: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
      location: z.string().nullable().optional(),
      email: z.string().email('Invalid email address').or(z.literal('')).nullable().optional(),
      phone: z.string().nullable().optional(),
      size: z.string().nullable().optional(),
      foundedYear: z.number().nullable().optional(),
      address: z.string().nullable().optional(),
    })
    .optional(),
});

export const updateApplicantStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  notes: z.string().optional(),
  joiningDate: z.string().optional(),
  offerStatus: z.string().optional(),
});

export const applicantQuerySchema = z.object({
  jobId: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  department: z.string().optional(),
  gradYear: z.string().optional(),
  minCgpa: z.string().optional(),
  maxCgpa: z.string().optional(),
  minAts: z.string().optional(),
  maxAts: z.string().optional(),
  skill: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const scheduleInterviewSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID'),
  date: z.string().min(1, 'Interview date is required'),
  time: z.string().optional(),
  duration: z.number().optional(),
  interviewer: z.string().optional(),
  meetingLink: z.string().url('Invalid meeting URL').or(z.literal('')).optional(),
  roundType: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const updateInterviewSchema = z.object({
  date: z.string().optional(),
  time: z.string().optional(),
  duration: z.number().optional(),
  interviewer: z.string().optional(),
  meetingLink: z.string().optional(),
  roundType: z.string().optional(),
  location: z.string().optional(),
  status: z.nativeEnum(InterviewStatus).optional(),
  result: z.enum(['PENDING', 'PASSED', 'FAILED']).optional(),
  feedback: z.string().optional(),
  notes: z.string().optional(),
});
