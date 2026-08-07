import { z } from 'zod';
import { JobStatus } from '@prisma/client';

export const createJobSchema = z.object({
  title: z.string().min(2, 'Job title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  companyId: z.string().uuid('Invalid company ID').optional(),
  type: z.string().min(2, 'Job type (e.g. Full-time) is required'),
  location: z.string().min(2, 'Location is required'),
  workMode: z.string().optional(),
  employmentType: z.string().optional(),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  deadline: z.string().min(1, 'Application deadline is required'),
  status: z.nativeEnum(JobStatus).optional(),
  eligibility: z.string().nullable().optional(),
  requirements: z.string().nullable().optional(),
  requiredSkills: z.array(z.string()).optional(),
  preferredSkills: z.array(z.string()).optional(),
  minCgpa: z.number().nullable().optional(),
  minActivityPoints: z.number().int().min(0).nullable().optional(),
  eligibleDepartments: z.array(z.string()).optional(),
  eligibleGradYears: z.array(z.number()).optional(),
  requiredExperience: z.number().nullable().optional(),
  openings: z.number().optional(),
});

export const updateJobSchema = createJobSchema.partial();

export const jobQuerySchema = z.object({
  status: z.nativeEnum(JobStatus).optional(),
  search: z.string().optional(),
  type: z.string().optional(),
});
