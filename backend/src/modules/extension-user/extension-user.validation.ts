import { z } from 'zod';

export const registerExtensionUserSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name is too long'),
  email: z.string().email('Invalid email address format'),
  consentAccepted: z.boolean().refine((val) => val === true, {
    message: 'Privacy consent must be accepted to register',
  }),
  extensionVersion: z.string().optional().default('1.0.0'),
});

export const createActivityLogSchema = z.object({
  userId: z.string().uuid('Invalid user ID format').or(z.string().min(1)),
  activityType: z.string().min(1, 'Activity type is required'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateExtensionUserSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  fullName: z.string().min(1).optional(),
});

export type RegisterExtensionUserInput = z.infer<typeof registerExtensionUserSchema>;
export type CreateActivityLogInput = z.infer<typeof createActivityLogSchema>;
export type UpdateExtensionUserInput = z.infer<typeof updateExtensionUserSchema>;
