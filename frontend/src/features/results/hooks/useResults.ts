import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resultsService } from '../services/results.service';
import { toast } from '@/store';

export function useResults() {
  const queryClient = useQueryClient();

  const resultsQuery = useQuery({
    queryKey: ['academic-results'],
    queryFn: resultsService.getResults,
  });

  const statusQuery = useQuery({
    queryKey: ['academic-results', 'status'],
    queryFn: resultsService.getStatus,
  });

  const syncMutation = useMutation({
    mutationFn: resultsService.syncResults,
    onSuccess: () => {
      toast.success('BIP Academic results synchronized successfully!');
      queryClient.invalidateQueries({ queryKey: ['academic-results'] });
      queryClient.invalidateQueries({ queryKey: ['academic-results', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to sync academic results.');
    },
  });

  return {
    resultsQuery,
    statusQuery,
    syncResults: syncMutation.mutateAsync,
    isSyncing: syncMutation.isPending,
  };
}

export function useSemesterDetail(semester: number) {
  return useQuery({
    queryKey: ['academic-results', semester],
    queryFn: () => resultsService.getSemesterDetail(semester),
    enabled: !!semester,
  });
}
