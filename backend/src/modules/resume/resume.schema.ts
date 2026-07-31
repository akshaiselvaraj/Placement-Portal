import { z } from 'zod';

export const createResumeSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  title: z.string().min(1, 'Resume title is required'),
  data: z.any(),
});

export const updateResumeSchema = createResumeSchema.partial();
