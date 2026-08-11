import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityService, type CreateActivityPayload, type ActivityOtpType } from '../services/activity.service';
import { toast } from '@/store';

export function useActivities() {
  const queryClient = useQueryClient();

  // 1. Fetch all activities
  const activitiesQuery = useQuery({
    queryKey: ['activities'],
    queryFn: () => activityService.getActivities(),
  });

  // 2. Fetch student personal activities
  const myActivitiesQuery = useQuery({
    queryKey: ['activities', 'my'],
    queryFn: () => activityService.getMyActivities(),
  });

  // 3. Fetch analytics
  const analyticsQuery = useQuery({
    queryKey: ['activities', 'analytics'],
    queryFn: () => activityService.getAnalytics(),
  });

  // Mutations
  const createActivityMutation = useMutation({
    mutationFn: (data: CreateActivityPayload) => activityService.createActivity(data),
    onSuccess: () => {
      toast.success('Activity created successfully!');
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create activity');
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateActivityPayload> }) =>
      activityService.updateActivity(id, data),
    onSuccess: (data) => {
      toast.success('Activity updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activities', data.id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update activity');
    },
  });

  const cancelActivityMutation = useMutation({
    mutationFn: (id: string) => activityService.cancelActivity(id),
    onSuccess: (data) => {
      toast.success('Activity cancelled successfully!');
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activities', data.id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cancel activity');
    },
  });

  return {
    activitiesQuery,
    myActivitiesQuery,
    analyticsQuery,
    createActivity: createActivityMutation.mutateAsync,
    isCreating: createActivityMutation.isPending,
    updateActivity: updateActivityMutation.mutateAsync,
    isUpdating: updateActivityMutation.isPending,
    cancelActivity: cancelActivityMutation.mutateAsync,
    isCancelling: cancelActivityMutation.isPending,
  };
}

export function useActivityDetails(id: string) {
  const queryClient = useQueryClient();

  const detailsQuery = useQuery({
    queryKey: ['activities', id],
    queryFn: () => activityService.getActivityDetails(id),
    enabled: !!id,
  });

  const participantsQuery = useQuery({
    queryKey: ['activities', id, 'participants'],
    queryFn: () => activityService.getParticipants(id),
    enabled: !!id,
  });

  const auditLogsQuery = useQuery({
    queryKey: ['activities', id, 'audit-logs'],
    queryFn: () => activityService.getAuditLogs(id),
    enabled: !!id,
  });

  const regenerateOtpMutation = useMutation({
    mutationFn: (type: ActivityOtpType) => activityService.regenerateOtp(id, type),
    onSuccess: () => {
      toast.success('OTP regenerated successfully!');
      queryClient.invalidateQueries({ queryKey: ['activities', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to regenerate OTP');
    },
  });

  // Student Actions
  const joinActivityMutation = useMutation({
    mutationFn: (otp: string) => activityService.joinActivity(id, otp),
    onSuccess: () => {
      toast.success('Successfully joined the activity!');
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activities', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['activities', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to join activity');
    },
  });

  const startActivityMutation = useMutation({
    mutationFn: (otp: string) => activityService.startActivity(id, otp),
    onSuccess: () => {
      toast.success('Activity started successfully! In progress.');
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activities', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['activities', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to start activity');
    },
  });

  const endActivityMutation = useMutation({
    mutationFn: (otp: string) => activityService.endActivity(id, otp),
    onSuccess: () => {
      toast.success('Activity completed successfully! Points awarded.');
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activities', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['activities', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to complete activity');
    },
  });

  return {
    detailsQuery,
    participantsQuery,
    auditLogsQuery,
    regenerateOtp: regenerateOtpMutation.mutateAsync,
    isRegeneratingOtp: regenerateOtpMutation.isPending,
    joinActivity: joinActivityMutation.mutateAsync,
    isJoining: joinActivityMutation.isPending,
    startActivity: startActivityMutation.mutateAsync,
    isStarting: startActivityMutation.isPending,
    endActivity: endActivityMutation.mutateAsync,
    isEnding: endActivityMutation.isPending,
  };
}
