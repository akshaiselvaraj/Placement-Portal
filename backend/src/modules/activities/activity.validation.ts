import { z } from 'zod';
import { ACTIVITY_CATEGORIES } from './activity.constants';

export const createActivitySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  category: z.enum(ACTIVITY_CATEGORIES),
  startTime: z.string().transform((val) => new Date(val)),
  endTime: z.string().transform((val) => new Date(val)),
  points: z.number().int().min(0, 'Points must be 0 or greater'),
  maxParticipants: z.number().int().min(1, 'Max participants must be at least 1').nullable().optional(),
  venue: z.string().max(100).nullable().optional(),
  instructions: z.string().nullable().optional(),
  gracePeriodMinutes: z.number().int().min(0).default(0),
}).refine((data) => data.endTime > data.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const updateActivitySchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(5).optional(),
  category: z.enum(ACTIVITY_CATEGORIES).optional(),
  startTime: z.string().transform((val) => new Date(val)).optional(),
  endTime: z.string().transform((val) => new Date(val)).optional(),
  points: z.number().int().min(0).optional(),
  maxParticipants: z.number().int().min(1).nullable().optional(),
  venue: z.string().max(100).nullable().optional(),
  instructions: z.string().nullable().optional(),
  gracePeriodMinutes: z.number().int().min(0).optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const verifyOtpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});
