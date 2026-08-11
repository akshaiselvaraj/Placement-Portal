import { Router as ExpressRouter } from 'express';
import { ActivityController } from './activity.controller';
import { authenticate, authorize, validate } from '../../middleware';
import { createActivitySchema, updateActivitySchema, verifyOtpSchema } from './activity.validation';

const router = ExpressRouter();

// General Activity List & Analytics
router.get('/', authenticate, ActivityController.getActivities);
router.get('/my', authenticate, authorize('STUDENT'), ActivityController.getStudentActivities);
router.get('/analytics', authenticate, authorize('ADMIN', 'PLACEMENT_OFFICER'), ActivityController.getAnalytics);

// Create Activity
router.post('/', authenticate, authorize('ADMIN', 'PLACEMENT_OFFICER'), validate(createActivitySchema), ActivityController.createActivity);

// Specific Activity routes
router.get('/:id', authenticate, ActivityController.getActivityDetails);
router.put('/:id', authenticate, authorize('ADMIN', 'PLACEMENT_OFFICER'), validate(updateActivitySchema), ActivityController.updateActivity);
router.delete('/:id', authenticate, authorize('ADMIN', 'PLACEMENT_OFFICER'), ActivityController.cancelActivity);

// OTP Generation
router.post('/:id/otps/generate', authenticate, authorize('ADMIN', 'PLACEMENT_OFFICER'), ActivityController.regenerateOtp);

// Participant Management
router.get('/:id/participants', authenticate, authorize('ADMIN', 'PLACEMENT_OFFICER'), ActivityController.getParticipants);
router.get('/:id/audit', authenticate, authorize('ADMIN', 'PLACEMENT_OFFICER'), ActivityController.getAuditLogs);

// Student OTP verification flows
router.post('/:id/join', authenticate, authorize('STUDENT'), validate(verifyOtpSchema), ActivityController.joinActivity);
router.post('/:id/start', authenticate, authorize('STUDENT'), validate(verifyOtpSchema), ActivityController.startActivity);
router.post('/:id/end', authenticate, authorize('STUDENT'), validate(verifyOtpSchema), ActivityController.endActivity);

export default router;
