import { z } from 'zod';
import { PS_LIMITS } from './ps.constants';

export const connectPSSchema = z.object({
  activityPoints: z.number().min(PS_LIMITS.MIN_POINTS, {
    message: `Activity points must be greater than or equal to ${PS_LIMITS.MIN_POINTS}`,
  }),
  opportunityPoints: z.number().min(PS_LIMITS.MIN_POINTS, {
    message: `Opportunity points must be greater than or equal to ${PS_LIMITS.MIN_POINTS}`,
  }),
  responsiveScore: z.number().min(PS_LIMITS.MIN_SCORE, {
    message: `Responsive score must be greater than or equal to ${PS_LIMITS.MIN_SCORE}`,
  }),
  levelClearance: z.string().nullable().optional(),
});
