import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  linkedin: z.string().url('Invalid URL').nullable().or(z.literal('')).optional(),
  github: z.string().url('Invalid URL').nullable().or(z.literal('')).optional(),
  website: z.string().url('Invalid URL').nullable().or(z.literal('')).optional(),
  cgpa: z.number().min(0).max(10).nullable().optional(),
  tenthMarks: z.number().min(0).max(100).nullable().optional(),
  twelfthMarks: z.number().min(0).max(100).nullable().optional(),
  activityPoints: z.number().int().min(0).nullable().optional(),
});

export const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().min(1, 'Field of study is required'),
  startYear: z.number().int().min(1900).max(2100),
  endYear: z.number().int().min(1900).max(2100).nullable().optional(),
  grade: z.string().nullable().optional(),
});

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  techStack: z.array(z.string()).min(1, 'At least one technology is required'),
  liveUrl: z.string().url('Invalid URL').nullable().or(z.literal('')).optional(),
  repoUrl: z.string().url('Invalid URL').nullable().or(z.literal('')).optional(),
});

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'EXPERT']).optional(),
});

export const certificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  date: z.string().datetime().nullable().optional(),
  url: z.string().url('Invalid URL').nullable().or(z.literal('')).optional(),
});
