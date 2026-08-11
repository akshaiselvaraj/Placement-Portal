import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types';

export type ActivityStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
export type ParticipationStatus = 'ASSIGNED' | 'STARTED' | 'COMPLETED' | 'ABSENT';
export type ActivityOtpType = 'ADD_PARTICIPANT' | 'START_ACTIVITY' | 'END_ACTIVITY';

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  startTime: string;
  endTime: string;
  points: number;
  maxParticipants?: number | null;
  venue?: string | null;
  instructions?: string | null;
  gracePeriodMinutes: number;
  status: ActivityStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    participants: number;
  };
}

export interface ActivityOtp {
  type: ActivityOtpType;
  otp: string;
  expiresAt: string;
}

export interface ActivityParticipant {
  id: string;
  activityId: string;
  studentId: string;
  status: ParticipationStatus;
  assignedAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  pointsAwarded: number;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    rollNumber: string;
    department: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  activityId?: string | null;
  studentId?: string | null;
  timestamp: string;
  metadata?: any;
}

export interface ActivityAnalytics {
  totalActivities: number;
  upcoming: number;
  live: number;
  completed: number;
  cancelled: number;
  totalParticipants: number;
  completionRate: number;
}

export interface CreateActivityPayload {
  title: string;
  description: string;
  category: string;
  startTime: string;
  endTime: string;
  points: number;
  maxParticipants?: number | null;
  venue?: string | null;
  instructions?: string | null;
  gracePeriodMinutes: number;
}

export const activityService = {
  getActivities: async (): Promise<Activity[]> => {
    const res = await api.get<ApiResponse<Activity[]>>('/activities');
    return res.data.data;
  },

  getMyActivities: async (): Promise<(ActivityParticipant & { activity: Activity })[]> => {
    const res = await api.get<ApiResponse<(ActivityParticipant & { activity: Activity })[]>>('/activities/my');
    return res.data.data;
  },

  getActivityDetails: async (id: string): Promise<Activity & { otps?: ActivityOtp[] }> => {
    const res = await api.get<ApiResponse<Activity & { otps?: ActivityOtp[] }>>(`/activities/${id}`);
    return res.data.data;
  },

  createActivity: async (data: CreateActivityPayload): Promise<Activity> => {
    const res = await api.post<ApiResponse<Activity>>('/activities', data);
    return res.data.data;
  },

  updateActivity: async (id: string, data: Partial<CreateActivityPayload>): Promise<Activity> => {
    const res = await api.put<ApiResponse<Activity>>(`/activities/${id}`, data);
    return res.data.data;
  },

  cancelActivity: async (id: string): Promise<Activity> => {
    const res = await api.delete<ApiResponse<Activity>>(`/activities/${id}`);
    return res.data.data;
  },

  regenerateOtp: async (id: string, type: ActivityOtpType): Promise<ActivityOtp> => {
    const res = await api.post<ApiResponse<ActivityOtp>>(`/activities/${id}/otps/generate`, { type });
    return res.data.data;
  },

  getParticipants: async (id: string): Promise<ActivityParticipant[]> => {
    const res = await api.get<ApiResponse<ActivityParticipant[]>>(`/activities/${id}/participants`);
    return res.data.data;
  },

  getAuditLogs: async (id: string): Promise<AuditLog[]> => {
    const res = await api.get<ApiResponse<AuditLog[]>>(`/activities/${id}/audit`);
    return res.data.data;
  },

  getAnalytics: async (): Promise<ActivityAnalytics> => {
    const res = await api.get<ApiResponse<ActivityAnalytics>>('/activities/analytics');
    return res.data.data;
  },

  joinActivity: async (id: string, otp: string): Promise<ActivityParticipant> => {
    const res = await api.post<ApiResponse<ActivityParticipant>>(`/activities/${id}/join`, { otp });
    return res.data.data;
  },

  startActivity: async (id: string, otp: string): Promise<ActivityParticipant> => {
    const res = await api.post<ApiResponse<ActivityParticipant>>(`/activities/${id}/start`, { otp });
    return res.data.data;
  },

  endActivity: async (id: string, otp: string): Promise<ActivityParticipant> => {
    const res = await api.post<ApiResponse<ActivityParticipant>>(`/activities/${id}/end`, { otp });
    return res.data.data;
  },
};
