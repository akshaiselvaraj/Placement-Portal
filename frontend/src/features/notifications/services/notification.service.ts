import { api } from '@/lib/axios';
import type { ApiResponse, Notification } from '@/types';

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const res = await api.get<ApiResponse<Notification[]>>('/notifications');
    return res.data.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const res = await api.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return res.data.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put<ApiResponse<null>>('/notifications/read');
  },

  deleteNotification: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/notifications/${id}`);
  },
};

export default notificationService;
