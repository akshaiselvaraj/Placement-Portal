import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerFormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['STUDENT', 'RECRUITER', 'PLACEMENT_OFFICER', 'ADMIN']),
  
  // Student fields
  rollNumber: z.string().optional(),
  department: z.string().optional(),
  batch: z.string().optional(),
  
  // Recruiter fields
  companyName: z.string().optional(),
  designation: z.string().optional(),
  phone: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'STUDENT') {
    if (!data.rollNumber?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Roll number is required for students',
        path: ['rollNumber'],
      });
    }
    if (!data.department) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Department is required for students',
        path: ['department'],
      });
    }
    if (!data.batch?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Batch (e.g. 2022-2026) is required for students',
        path: ['batch'],
      });
    }
  }

  if (data.role === 'RECRUITER') {
    if (!data.companyName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Company Name is required for recruiters',
        path: ['companyName'],
      });
    }
    if (!data.designation?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Designation is required for recruiters',
        path: ['designation'],
      });
    }
  }

  if (data.role === 'PLACEMENT_OFFICER') {
    if (!data.department) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Department is required for placement officers',
        path: ['department'],
      });
    }
  }
});
