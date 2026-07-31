import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';
import { toast } from '@/store';

export function useAdminData(userFilters?: Record<string, any>) {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['admin-users', userFilters],
    queryFn: () => adminService.getUsers(userFilters),
  });

  const companiesQuery = useQuery({
    queryKey: ['admin-companies'],
    queryFn: adminService.getCompanies,
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminService.toggleUserStatus(id, isActive),
    onSuccess: (data) => {
      toast.success(`User account status updated to ${data.isActive ? 'Active' : 'Inactive'}`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: adminService.createCompany,
    onSuccess: () => {
      toast.success('Company profile registered successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create company profile');
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      adminService.updateCompany(id, data),
    onSuccess: () => {
      toast.success('Company profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update company profile');
    },
  });

  return {
    // Queries
    users: usersQuery.data || [],
    isLoadingUsers: usersQuery.isLoading,
    refetchUsers: usersQuery.refetch,

    companies: companiesQuery.data || [],
    isLoadingCompanies: companiesQuery.isLoading,
    refetchCompanies: companiesQuery.refetch,

    // Mutations
    toggleUserStatus: toggleUserStatusMutation.mutateAsync,
    isTogglingStatus: toggleUserStatusMutation.isPending,

    createCompany: createCompanyMutation.mutateAsync,
    isCreatingCompany: createCompanyMutation.isPending,

    updateCompany: updateCompanyMutation.mutateAsync,
    isUpdatingCompany: updateCompanyMutation.isPending,
  };
}

export default useAdminData;
