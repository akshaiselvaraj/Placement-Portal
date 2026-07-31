import { Router } from 'express';
import { StudentController } from './student.controller';
import { authenticate, authorize, validate } from '../../middleware';
import {
  updateProfileSchema,
  educationSchema,
  projectSchema,
  skillSchema,
  certificationSchema,
} from './student.schema';

const router = Router();

// Student profile is viewable by any authenticated user
router.get('/profile', authenticate, StudentController.getProfile);

// Write actions restricted to STUDENT role only
router.put('/profile', authenticate, authorize('STUDENT'), validate(updateProfileSchema), StudentController.updateProfile);

// Education CRUD
router.post('/education', authenticate, authorize('STUDENT'), validate(educationSchema), StudentController.addEducation);
router.put('/education/:id', authenticate, authorize('STUDENT'), validate(educationSchema), StudentController.updateEducation);
router.delete('/education/:id', authenticate, authorize('STUDENT'), StudentController.deleteEducation);

// Projects CRUD
router.post('/projects', authenticate, authorize('STUDENT'), validate(projectSchema), StudentController.addProject);
router.put('/projects/:id', authenticate, authorize('STUDENT'), validate(projectSchema), StudentController.updateProject);
router.delete('/projects/:id', authenticate, authorize('STUDENT'), StudentController.deleteProject);

// Skills CRUD
router.post('/skills', authenticate, authorize('STUDENT'), validate(skillSchema), StudentController.addSkill);
router.delete('/skills/:id', authenticate, authorize('STUDENT'), StudentController.deleteSkill);

// Certifications CRUD
router.post('/certifications', authenticate, authorize('STUDENT'), validate(certificationSchema), StudentController.addCertification);
router.put('/certifications/:id', authenticate, authorize('STUDENT'), validate(certificationSchema), StudentController.updateCertification);
router.delete('/certifications/:id', authenticate, authorize('STUDENT'), StudentController.deleteCertification);

export default router;
