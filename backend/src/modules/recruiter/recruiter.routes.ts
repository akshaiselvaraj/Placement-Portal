import { Router } from 'express';
import { RecruiterController } from './recruiter.controller';
import { authenticate, authorize, validate } from '../../middleware';
import {
  updateRecruiterProfileSchema,
  updateApplicantStatusSchema,
  applicantQuerySchema,
} from './recruiter.schema';

const router = Router();

// Secure all endpoints under authentication + Recruiter role check
router.get('/profile', authenticate, authorize('RECRUITER'), RecruiterController.getProfile);
router.put('/profile', authenticate, authorize('RECRUITER'), validate(updateRecruiterProfileSchema), RecruiterController.updateProfile);

router.get('/company', authenticate, authorize('RECRUITER'), RecruiterController.getCompany);

router.get('/applicants', authenticate, authorize('RECRUITER'), validate(applicantQuerySchema, 'query'), RecruiterController.getApplicants);
router.put('/applicants/:id/status', authenticate, authorize('RECRUITER'), validate(updateApplicantStatusSchema), RecruiterController.updateApplicantStatus);

export default router;
