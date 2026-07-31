import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  batch: z.string().optional(),
  department: z.string().optional(),
});
