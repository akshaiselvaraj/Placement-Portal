import { z } from 'zod';

export const subjectSyncSchema = z.object({
  courseCode: z.string().min(1, 'Course code is required'),
  courseName: z.string().min(1, 'Course name is required'),
  credits: z.number().int().min(0, 'Credits must be non-negative'),
  grade: z.string().min(1, 'Grade is required'),
  gradePoint: z.number().min(0, 'Grade point must be non-negative'),
  marks: z.number().int().nullable().optional(),
  resultStatus: z.string().default('PASS'),
});

export const semesterSyncSchema = z.object({
  semester: z.number().int().min(1, 'Semester must be positive'),
  sgpa: z.number().min(0, 'SGPA must be non-negative'),
  cgpa: z.number().min(0, 'CGPA must be non-negative'),
  status: z.string().default('PUBLISHED'),
  subjects: z.array(subjectSyncSchema).min(1, 'At least one subject is required'),
});

export const syncResultsSchema = z.object({
  semesters: z.array(semesterSyncSchema).min(1, 'At least one semester is required'),
});
