import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeService } from '../services/resume.service';
import { toast } from '@/store';

export function useResumes(resumeId?: string) {
  const queryClient = useQueryClient();

  const resumesQuery = useQuery({
    queryKey: ['resumes'],
    queryFn: resumeService.getResumes,
    enabled: !resumeId,
  });

  const resumeDetailQuery = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: () => resumeService.getResumeById(resumeId!),
    enabled: !!resumeId,
  });

  const createResumeMutation = useMutation({
    mutationFn: resumeService.createResume,
    onSuccess: () => {
      toast.success('Resume template saved. Awaiting review.');
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create resume');
    },
  });

  const updateResumeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => resumeService.updateResume(id, data),
    onSuccess: (data) => {
      toast.success('Resume updated successfully. Under review.');
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.invalidateQueries({ queryKey: ['resume', data.id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update resume');
    },
  });

  const deleteResumeMutation = useMutation({
    mutationFn: resumeService.deleteResume,
    onSuccess: () => {
      toast.success('Resume deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete resume');
    },
  });

  return {
    // Queries
    resumes: resumesQuery.data || [],
    isLoadingResumes: resumesQuery.isLoading,

    resume: resumeDetailQuery.data,
    isLoadingResume: resumeDetailQuery.isLoading,
    refetchResume: resumeDetailQuery.refetch,

    // Mutations
    createResume: createResumeMutation.mutateAsync,
    isCreatingResume: createResumeMutation.isPending,

    updateResume: updateResumeMutation.mutateAsync,
    isUpdatingResume: updateResumeMutation.isPending,

    deleteResume: deleteResumeMutation.mutateAsync,
    isDeletingResume: deleteResumeMutation.isPending,
  };
}

export default useResumes;
