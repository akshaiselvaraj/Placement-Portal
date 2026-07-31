import { Request, Response } from 'express';
import { NotificationService } from './notification.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class NotificationController {
  static getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const list = await NotificationService.getNotifications(req.user!.id);
    return ApiResponse.success(res, list, 'Notifications retrieved successfully');
  });

  static markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const notification = await NotificationService.markAsRead(req.user!.id, req.params.id as string);
    return ApiResponse.success(res, notification, 'Notification marked as read');
  });

  static markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    await NotificationService.markAllAsRead(req.user!.id);
    return ApiResponse.success(res, null, 'All notifications marked as read');
  });

  static deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    await NotificationService.deleteNotification(req.user!.id, req.params.id as string);
    return ApiResponse.success(res, null, 'Notification deleted successfully');
  });
}
export default NotificationController;
