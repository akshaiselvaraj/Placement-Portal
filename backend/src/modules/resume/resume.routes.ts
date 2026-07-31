import { Router } from 'express';
import { ResumeController } from './resume.controller';
import { authenticate, authorize, validate } from '../../middleware';
import { createResumeSchema, updateResumeSchema } from './resume.schema';

const router = Router();

// Retrieve specific resume details (Open to Students, Recruiters, and Placement Officers)
router.get('/:id', authenticate, authorize('STUDENT', 'RECRUITER', 'PLACEMENT_OFFICER'), ResumeController.getResumeById);

// Write/Edit Actions (Strictly locked to Student role)
router.get('/', authenticate, authorize('STUDENT'), ResumeController.getResumes);
router.post('/', authenticate, authorize('STUDENT'), validate(createResumeSchema), ResumeController.createResume);
router.put('/:id', authenticate, authorize('STUDENT'), validate(updateResumeSchema), ResumeController.updateResume);
router.delete('/:id', authenticate, authorize('STUDENT'), ResumeController.deleteResume);

export default router;
