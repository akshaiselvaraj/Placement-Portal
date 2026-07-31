import { Router } from 'express';
import { PlacementOfficerController } from './placement-officer.controller';
import { authenticate, authorize, validate } from '../../middleware';
import {
  studentQuerySchema,
  verifyStudentSchema,
  approveAssetSchema,
  scheduleInterviewSchema,
  publishResultSchema,
} from './placement-officer.schema';

const router = Router();

// Apply global Placement Officer role guard to all routes in this sub-module
router.use(authenticate);
router.use(authorize('PLACEMENT_OFFICER'));

router.get('/students', validate(studentQuerySchema, 'query'), PlacementOfficerController.getStudents);
router.put('/students/:id/verify', validate(verifyStudentSchema), PlacementOfficerController.verifyStudent);

router.get('/resumes', PlacementOfficerController.getResumes);
router.put('/resumes/:id/approve', validate(approveAssetSchema), PlacementOfficerController.approveResume);

router.get('/portfolios', PlacementOfficerController.getPortfolios);
router.put('/portfolios/:id/approve', validate(approveAssetSchema), PlacementOfficerController.approvePortfolio);

router.get('/applications', PlacementOfficerController.getApplications);

router.post('/interviews', validate(scheduleInterviewSchema), PlacementOfficerController.scheduleInterview);
router.post('/results', validate(publishResultSchema), PlacementOfficerController.publishResult);

export default router;
