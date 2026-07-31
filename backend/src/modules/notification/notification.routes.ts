import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticate } from '../../middleware';

const router = Router();

// Apply global authentication check on all routes
router.use(authenticate);

router.get('/', NotificationController.getNotifications);
router.put('/read', NotificationController.markAllAsRead);
router.put('/:id/read', NotificationController.markAsRead);
router.delete('/:id', NotificationController.deleteNotification);

export default router;
