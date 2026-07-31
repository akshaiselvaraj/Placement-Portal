import { Router } from 'express';
import { JobController } from './job.controller';
import { authenticate, authorize, validate } from '../../middleware';
import { createJobSchema, updateJobSchema, jobQuerySchema } from './job.schema';

const router = Router();

// ── Public endpoints (authenticated but any role) ────────────
router.get(
  '/public',
  authenticate,
  validate(jobQuerySchema, 'query'),
  JobController.getPublicJobs
);

router.get('/public/:id', authenticate, JobController.getJobById);

// ── Student endpoints ────────────────────────────────────────
router.get(
  '/eligibility/:id',
  authenticate,
  authorize('STUDENT'),
  JobController.checkEligibility
);

router.post(
  '/apply/:id',
  authenticate,
  authorize('STUDENT'),
  JobController.applyToJob
);

router.get(
  '/applications',
  authenticate,
  authorize('STUDENT'),
  JobController.getStudentApplications
);

router.put(
  '/applications/:id/withdraw',
  authenticate,
  authorize('STUDENT'),
  JobController.withdrawApplication
);

// ── Recruiter endpoints ──────────────────────────────────────
router.get(
  '/recruiter',
  authenticate,
  authorize('RECRUITER'),
  validate(jobQuerySchema, 'query'),
  JobController.getRecruiterJobs
);

router.post(
  '/',
  authenticate,
  authorize('RECRUITER'),
  validate(createJobSchema),
  JobController.createJob
);

router.put(
  '/:id',
  authenticate,
  authorize('RECRUITER'),
  validate(updateJobSchema),
  JobController.updateJob
);

router.delete(
  '/:id',
  authenticate,
  authorize('RECRUITER'),
  JobController.deleteJob
);

export default router;
