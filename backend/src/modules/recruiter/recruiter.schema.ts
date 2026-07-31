import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';

export const updateRecruiterProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  designation: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
});

export const updateApplicantStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
});

export const applicantQuerySchema = z.object({
  jobId: z.string().optional(),
  status: z.string().optional(),
});
