import { z } from 'zod';
import { Role } from '@prisma/client';
import { ROLES } from '../../config/constants';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.nativeEnum(Role),
  // Student specific fields
  rollNumber: z.string().optional(),
  department: z.string().optional(),
  batch: z.string().optional(),
  // Recruiter specific fields
  companyName: z.string().optional(), // For new company creation or selection
  companyId: z.string().optional(),
  designation: z.string().optional(),
  phone: z.string().optional(),
}).refine((data) => {
  if (data.role === ROLES.STUDENT) {
    return !!data.rollNumber && !!data.department && !!data.batch;
  }
  if (data.role === ROLES.RECRUITER) {
    return !!data.designation && (!!data.companyId || !!data.companyName);
  }
  if (data.role === ROLES.PLACEMENT_OFFICER) {
    return !!data.department;
  }
  return true;
}, {
  message: 'Missing required profile details for the selected role',
  path: ['role'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});
