import prisma from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { NotificationType } from '@prisma/client';

export class NotificationService {
  static async getNotifications(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async markAsRead(userId: string, id: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw ApiError.notFound('Notification not found or access denied');
    }

    return await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  static async deleteNotification(userId: string, id: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw ApiError.notFound('Notification not found or access denied');
    }

    return await prisma.notification.delete({
      where: { id },
    });
  }

  /**
   * Utility helper to trigger and store notifications from any module in the system.
   */
  static async triggerNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    link?: string
  ) {
    try {
      return await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          link: link || null,
        },
      });
    } catch (err) {
      console.error('Failed to trigger in-app notification:', err);
    }
  }
}
export default NotificationService;
