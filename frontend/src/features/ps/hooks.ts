import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { psApi } from './api';
import { toast } from '@/store';
import type { SyncPSDataPayload } from './types';

export function usePS() {
  return useQuery({
    queryKey: ['ps-data'],
    queryFn: psApi.getPSMe,
    retry: false,
  });
}

export function useConnectPS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SyncPSDataPayload) => psApi.connectPS(data),
    onSuccess: () => {
      toast.success('PS account connected successfully');
      queryClient.invalidateQueries({ queryKey: ['ps-data'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to connect PS account');
    },
  });
}

export function useDisconnectPS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: psApi.disconnectPS,
    onSuccess: () => {
      toast.success('PS account disconnected successfully');
      queryClient.invalidateQueries({ queryKey: ['ps-data'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to disconnect PS account');
    },
  });
}
