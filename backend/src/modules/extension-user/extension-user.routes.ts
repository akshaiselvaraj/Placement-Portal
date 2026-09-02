import { Router } from 'express';
import { ExtensionUserController } from './extension-user.controller';

const router = Router();

// Extension public endpoints
router.post('/register', ExtensionUserController.registerUser);
router.post('/activity', ExtensionUserController.logActivity);

// Admin endpoints (protected by authentication & ADMIN role checks where configured)
router.get('/', ExtensionUserController.getUsers);
router.get('/dashboard-stats', ExtensionUserController.getDashboardStats);
router.get('/activities/all', ExtensionUserController.getActivityLogs);
router.get('/:id', ExtensionUserController.getUserById);
router.put('/:id', ExtensionUserController.updateUser);

export default router;
export const extensionUserRoutes = router;
