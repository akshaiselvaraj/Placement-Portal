import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate, authorize, validate } from '../../middleware';
import {
  userQuerySchema,
  toggleUserStatusSchema,
  createCompanySchema,
  updateCompanySchema,
} from './admin.schema';

const router = Router();

// Apply global authentication and authorization guards to endpoints
router.use(authenticate);
router.use(authorize('ADMIN', 'PLACEMENT_OFFICER'));

router.get('/users', validate(userQuerySchema, 'query'), AdminController.getUsers);
router.put('/users/:id/status', validate(toggleUserStatusSchema), AdminController.toggleUserStatus);

router.get('/companies', AdminController.getCompanies);
router.post('/companies', validate(createCompanySchema), AdminController.createCompany);
router.put('/companies/:id', validate(updateCompanySchema), AdminController.updateCompany);

export default router;
