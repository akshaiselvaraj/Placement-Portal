import { Router } from 'express';
import { RecruiterController } from './recruiter.controller';
import { authenticate, authorize, validate } from '../../middleware';
import {
  updateRecruiterProfileSchema,
  updateApplicantStatusSchema,
  applicantQuerySchema,
  scheduleInterviewSchema,
  updateInterviewSchema,
} from './recruiter.schema';

const router = Router();

// Secure all endpoints under authentication + Recruiter role check
router.get('/dashboard', authenticate, authorize('RECRUITER'), RecruiterController.getDashboard);
router.get('/profile', authenticate, authorize('RECRUITER'), RecruiterController.getProfile);
router.put('/profile', authenticate, authorize('RECRUITER'), validate(updateRecruiterProfileSchema), RecruiterController.updateProfile);

router.get('/company', authenticate, authorize('RECRUITER'), RecruiterController.getCompany);

router.get('/applicants', authenticate, authorize('RECRUITER'), validate(applicantQuerySchema, 'query'), RecruiterController.getApplicants);
router.get('/applicants/:id', authenticate, authorize('RECRUITER'), RecruiterController.getCandidateDetails);
router.put('/applicants/:id/status', authenticate, authorize('RECRUITER'), validate(updateApplicantStatusSchema), RecruiterController.updateApplicantStatus);

router.get('/candidates/search', authenticate, authorize('RECRUITER'), RecruiterController.searchCandidates);

router.get('/interviews', authenticate, authorize('RECRUITER'), RecruiterController.getInterviews);
router.post('/interviews', authenticate, authorize('RECRUITER'), validate(scheduleInterviewSchema), RecruiterController.scheduleInterview);
router.put('/interviews/:id', authenticate, authorize('RECRUITER'), validate(updateInterviewSchema), RecruiterController.updateInterview);

router.get('/hiring-history', authenticate, authorize('RECRUITER'), RecruiterController.getHiringHistory);

export default router;
