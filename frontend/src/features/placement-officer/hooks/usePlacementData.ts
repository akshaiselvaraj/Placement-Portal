import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { placementService } from '../services/placement.service';
import { toast } from '@/store';

export function usePlacementData(studentFilters?: Record<string, any>) {
  const queryClient = useQueryClient();

  const studentsQuery = useQuery({
    queryKey: ['placement-students', studentFilters],
    queryFn: () => placementService.getStudents(studentFilters),
  });

  const resumesQuery = useQuery({
    queryKey: ['placement-resumes'],
    queryFn: placementService.getResumes,
  });

  const portfoliosQuery = useQuery({
    queryKey: ['placement-portfolios'],
    queryFn: placementService.getPortfolios,
  });

  const applicationsQuery = useQuery({
    queryKey: ['placement-applications'],
    queryFn: placementService.getApplications,
  });

  const verifyStudentMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      placementService.verifyStudent(id, status),
    onSuccess: (data) => {
      toast.success(`Student profile status updated to ${data.profileStatus}`);
      queryClient.invalidateQueries({ queryKey: ['placement-students'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update student verification status');
    },
  });

  const approveResumeMutation = useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      placementService.approveResume(id, isApproved),
    onSuccess: (data) => {
      toast.success(`Resume template ${data.isApproved ? 'Approved' : 'Rejected'}`);
      queryClient.invalidateQueries({ queryKey: ['placement-resumes'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update resume approval');
    },
  });

  const approvePortfolioMutation = useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      placementService.approvePortfolio(id, isApproved),
    onSuccess: (data) => {
      toast.success(`Portfolio theme ${data.isApproved ? 'Approved' : 'Rejected'}`);
      queryClient.invalidateQueries({ queryKey: ['placement-portfolios'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update portfolio approval');
    },
  });

  const scheduleInterviewMutation = useMutation({
    mutationFn: placementService.scheduleInterview,
    onSuccess: () => {
      toast.success('Interview scheduled successfully');
      queryClient.invalidateQueries({ queryKey: ['placement-applications'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to schedule interview');
    },
  });

  const publishResultMutation = useMutation({
    mutationFn: placementService.publishResult,
    onSuccess: (data) => {
      toast.success(`Result published successfully. Status: ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ['placement-applications'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to publish result');
    },
  });

  return {
    // Queries
    students: studentsQuery.data || [],
    isLoadingStudents: studentsQuery.isLoading,
    refetchStudents: studentsQuery.refetch,

    resumes: resumesQuery.data || [],
    isLoadingResumes: resumesQuery.isLoading,

    portfolios: portfoliosQuery.data || [],
    isLoadingPortfolios: portfoliosQuery.isLoading,

    applications: applicationsQuery.data || [],
    isLoadingApplications: applicationsQuery.isLoading,

    // Mutations
    verifyStudent: verifyStudentMutation.mutateAsync,
    isVerifyingStudent: verifyStudentMutation.isPending,

    approveResume: approveResumeMutation.mutateAsync,
    isApprovingResume: approveResumeMutation.isPending,

    approvePortfolio: approvePortfolioMutation.mutateAsync,
    isApprovingPortfolio: approvePortfolioMutation.isPending,

    scheduleInterview: scheduleInterviewMutation.mutateAsync,
    isSchedulingInterview: scheduleInterviewMutation.isPending,

    publishResult: publishResultMutation.mutateAsync,
    isPublishingResult: publishResultMutation.isPending,
  };
}

export default usePlacementData;
