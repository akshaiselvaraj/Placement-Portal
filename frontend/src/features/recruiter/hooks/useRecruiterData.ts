import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruiterService } from '../services/recruiter.service';
import type { ApplicantFilters, ScheduleInterviewPayload, UpdateInterviewPayload } from '../services/recruiter.service';
import { toast } from '@/store';

export function useRecruiterData(filters?: ApplicantFilters) {
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: ['recruiter-dashboard'],
    queryFn: recruiterService.getDashboard,
    staleTime: 30_000,
  });

  const profileQuery = useQuery({
    queryKey: ['recruiter-profile'],
    queryFn: recruiterService.getProfile,
  });

  const companyQuery = useQuery({
    queryKey: ['recruiter-company'],
    queryFn: recruiterService.getCompany,
  });

  const applicantsQuery = useQuery({
    queryKey: ['recruiter-applicants', filters],
    queryFn: () => recruiterService.getApplicants(filters),
  });

  const updateProfileMutation = useMutation({
    mutationFn: recruiterService.updateProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['recruiter-profile'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-company'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    },
  });

  const updateApplicantStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; notes?: string } }) =>
      recruiterService.updateApplicantStatus(id, data),
    onSuccess: (data: any) => {
      toast.success(`Status updated to ${data.status?.replace('_', ' ')}`);
      queryClient.invalidateQueries({ queryKey: ['recruiter-applicants'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-dashboard'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update applicant status');
    },
  });

  const scheduleInterviewMutation = useMutation({
    mutationFn: (data: ScheduleInterviewPayload) => recruiterService.scheduleInterview(data),
    onSuccess: () => {
      toast.success('Interview scheduled successfully');
      queryClient.invalidateQueries({ queryKey: ['recruiter-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-applicants'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-dashboard'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to schedule interview');
    },
  });

  const updateInterviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInterviewPayload }) => recruiterService.updateInterview(id, data),
    onSuccess: () => {
      toast.success('Interview updated successfully');
      queryClient.invalidateQueries({ queryKey: ['recruiter-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-applicants'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-dashboard'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update interview');
    },
  });

  return {
    // Dashboard
    dashboard: dashboardQuery.data,
    isLoadingDashboard: dashboardQuery.isLoading,

    // Profile
    recruiter: profileQuery.data,
    isLoadingRecruiter: profileQuery.isLoading,

    // Company
    company: companyQuery.data,
    isLoadingCompany: companyQuery.isLoading,
    refetchCompany: companyQuery.refetch,

    // Applicants
    applicants: applicantsQuery.data || [],
    isLoadingApplicants: applicantsQuery.isLoading,
    refetchApplicants: applicantsQuery.refetch,

    // Mutations
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,

    updateApplicantStatus: updateApplicantStatusMutation.mutateAsync,
    isUpdatingStatus: updateApplicantStatusMutation.isPending,

    scheduleInterview: scheduleInterviewMutation.mutateAsync,
    isSchedulingInterview: scheduleInterviewMutation.isPending,

    updateInterview: updateInterviewMutation.mutateAsync,
    isUpdatingInterview: updateInterviewMutation.isPending,
  };
}

export function useRecruiterInterviews(status?: string) {
  const queryClient = useQueryClient();

  const interviewsQuery = useQuery({
    queryKey: ['recruiter-interviews', status],
    queryFn: () => recruiterService.getInterviews(status),
  });

  const updateInterviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInterviewPayload }) => recruiterService.updateInterview(id, data),
    onSuccess: () => {
      toast.success('Interview updated successfully');
      queryClient.invalidateQueries({ queryKey: ['recruiter-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-applicants'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update interview');
    },
  });

  return {
    interviews: interviewsQuery.data || [],
    isLoadingInterviews: interviewsQuery.isLoading,
    refetchInterviews: interviewsQuery.refetch,
    updateInterview: updateInterviewMutation.mutateAsync,
    isUpdating: updateInterviewMutation.isPending,
  };
}

export function useHiringHistory() {
  const hiringHistoryQuery = useQuery({
    queryKey: ['recruiter-hiring-history'],
    queryFn: recruiterService.getHiringHistory,
  });

  return {
    history: hiringHistoryQuery.data || [],
    isLoadingHistory: hiringHistoryQuery.isLoading,
  };
}

export default useRecruiterData;
