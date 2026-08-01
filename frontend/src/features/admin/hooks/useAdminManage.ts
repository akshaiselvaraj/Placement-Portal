import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminManageService } from '../services/admin-manage.service';
import type { AdminListFilters } from '../services/admin-manage.service';
import { toast } from '@/store';

export function useAdminManage(filters?: AdminListFilters) {
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: ['admin-manage-stats'],
    queryFn: adminManageService.getStats,
  });

  const listQuery = useQuery({
    queryKey: ['admin-manage-list', filters],
    queryFn: () => adminManageService.listAdmins(filters),
  });

  const createMutation = useMutation({
    mutationFn: adminManageService.createAdmin,
    onSuccess: () => {
      toast.success('Administrator account registered successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-manage-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-manage-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create administrator account');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      adminManageService.updateAdmin(id, data),
    onSuccess: () => {
      toast.success('Administrator profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-manage-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-manage-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update administrator profile');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminManageService.deleteAdmin,
    onSuccess: () => {
      toast.success('Administrator profile soft deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-manage-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-manage-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete administrator account');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: adminManageService.restoreAdmin,
    onSuccess: () => {
      toast.success('Administrator profile restored successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-manage-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-manage-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to restore administrator account');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminManageService.updateStatus(id, status),
    onSuccess: (data) => {
      toast.success(`Administrator status updated to ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ['admin-manage-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-manage-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update administrator status');
    },
  });

  const permissionsMutation = useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
      adminManageService.updatePermissions(id, permissions),
    onSuccess: () => {
      toast.success('Permissions updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-manage-list'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update permissions');
    },
  });

  return {
    // Queries
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    refetchStats: statsQuery.refetch,

    adminsData: listQuery.data,
    isLoadingList: listQuery.isLoading,
    refetchList: listQuery.refetch,

    // Mutations
    createAdmin: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateAdmin: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteAdmin: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    restoreAdmin: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,

    updateStatus: statusMutation.mutateAsync,
    isUpdatingStatus: statusMutation.isPending,

    updatePermissions: permissionsMutation.mutateAsync,
    isUpdatingPermissions: permissionsMutation.isPending,
  };
}

export function useAdminDetails(id: string | undefined) {
  return useQuery({
    queryKey: ['admin-manage-details', id],
    queryFn: () => adminManageService.getAdmin(id!),
    enabled: !!id,
  });
}

export function useAdminActivities(params?: { adminId?: string; action?: string; limit?: number }) {
  return useQuery({
    queryKey: ['admin-manage-activities', params],
    queryFn: () => adminManageService.getActivities(params),
  });
}
