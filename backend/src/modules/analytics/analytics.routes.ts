import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate, authorize, validate } from '../../middleware';
import { analyticsQuerySchema } from './analytics.schema';

const router = Router();

router.get(
  '/dashboard',
  authenticate,
  validate(analyticsQuerySchema, 'query'),
  AnalyticsController.getDashboardStats
);

router.get(
  '/officer-report',
  authenticate,
  authorize('PLACEMENT_OFFICER', 'ADMIN'),
  validate(analyticsQuerySchema, 'query'),
  AnalyticsController.getOfficerReports
);

export default router;
