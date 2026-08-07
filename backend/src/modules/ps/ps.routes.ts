import { Router } from 'express';
import { PSController } from './ps.controller';
import { authenticate, authorize } from '../../middleware';

const router = Router();

// Connect account: receive synced data
router.post('/connect', authenticate, authorize('STUDENT'), PSController.connectPS);

// Sync account data manually
router.post('/sync', authenticate, authorize('STUDENT'), PSController.connectPS);

// Get current logged-in user's PS details
router.get('/me', authenticate, authorize('STUDENT'), PSController.getPSData);

// Disconnect account: reset psConnected to false
router.post('/disconnect', authenticate, authorize('STUDENT'), PSController.disconnectPS);

export default router;
export const psRoutes = router;
