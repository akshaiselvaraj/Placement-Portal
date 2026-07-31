import { z } from 'zod';

export const createPortfolioSchema = z.object({
  themeId: z.string().min(1, 'Theme ID is required'),
  title: z.string().min(1, 'Portfolio title is required'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  data: z.any(),
  isPublished: z.boolean().optional(),
});

export const updatePortfolioSchema = createPortfolioSchema.partial();
