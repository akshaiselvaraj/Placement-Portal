import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruiterService } from '../services/recruiter.service';
import { toast } from '@/store';

export function useRecruiterData(filters?: { jobId?: string; status?: string }) {
  const queryClient = useQueryClient();

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
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    },
  });

  const updateApplicantStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      recruiterService.updateApplicantStatus(id, status),
    onSuccess: (data) => {
      toast.success(`Applicant status updated to ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ['recruiter-applicants'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update applicant status');
    },
  });

  return {
    // Queries
    recruiter: profileQuery.data,
    isLoadingRecruiter: profileQuery.isLoading,
    
    company: companyQuery.data,
    isLoadingCompany: companyQuery.isLoading,

    applicants: applicantsQuery.data || [],
    isLoadingApplicants: applicantsQuery.isLoading,
    refetchApplicants: applicantsQuery.refetch,

    // Mutations
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,

    updateApplicantStatus: updateApplicantStatusMutation.mutateAsync,
    isUpdatingStatus: updateApplicantStatusMutation.isPending,
  };
}
export default useRecruiterData;
