import { z } from 'zod';
import { Role } from '@prisma/client';

export const userQuerySchema = z.object({
  role: z.nativeEnum(Role).optional(),
  isActive: z.string().optional(), // 'true' or 'false'
  search: z.string().optional(),
});

export const toggleUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const createCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  logo: z.string().nullable().optional(),
  website: z.string().url('Invalid website URL').nullable().optional().or(z.literal('')),
  industry: z.string().min(2, 'Industry must be at least 2 characters').nullable().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').nullable().optional(),
  location: z.string().min(2, 'Location must be at least 2 characters').nullable().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();
