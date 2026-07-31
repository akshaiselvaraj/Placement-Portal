import { z } from 'zod';
import { ProfileStatus, ApplicationStatus } from '@prisma/client';

export const studentQuerySchema = z.object({
  department: z.string().optional(),
  batch: z.string().optional(),
  profileStatus: z.nativeEnum(ProfileStatus).optional(),
  cgpaMin: z.string().optional(),
});

export const verifyStudentSchema = z.object({
  status: z.nativeEnum(ProfileStatus),
});

export const approveAssetSchema = z.object({
  isApproved: z.boolean(),
});

export const scheduleInterviewSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  driveId: z.string().min(1, 'Drive ID is required'),
  date: z.string().min(1, 'Interview date/time is required'),
  type: z.string().min(1, 'Interview type is required'),
  location: z.string().min(1, 'Location or meeting link is required'),
});

export const publishResultSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  status: z.nativeEnum(ApplicationStatus),
});
