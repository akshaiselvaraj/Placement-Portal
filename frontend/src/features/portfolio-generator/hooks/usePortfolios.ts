import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioService } from '../services/portfolio.service';
import { toast } from '@/store';

export function usePortfolios(portfolioId?: string, slug?: string) {
  const queryClient = useQueryClient();

  const portfoliosQuery = useQuery({
    queryKey: ['portfolios'],
    queryFn: portfolioService.getPortfolios,
    enabled: !portfolioId && !slug,
  });

  const portfolioDetailQuery = useQuery({
    queryKey: ['portfolio', portfolioId],
    queryFn: () => portfolioService.getPortfolioById(portfolioId!),
    enabled: !!portfolioId,
  });

  const publicPortfolioQuery = useQuery({
    queryKey: ['public-portfolio', slug],
    queryFn: () => portfolioService.getPortfolioBySlug(slug!),
    enabled: !!slug,
  });

  const createPortfolioMutation = useMutation({
    mutationFn: portfolioService.createPortfolio,
    onSuccess: () => {
      toast.success('Portfolio page generated. Awaiting Verification.');
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create portfolio');
    },
  });

  const updatePortfolioMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      portfolioService.updatePortfolio(id, data),
    onSuccess: (data) => {
      toast.success('Portfolio changes saved. Under review.');
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', data.id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update portfolio');
    },
  });

  const deletePortfolioMutation = useMutation({
    mutationFn: portfolioService.deletePortfolio,
    onSuccess: () => {
      toast.success('Portfolio page deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete portfolio');
    },
  });

  return {
    // Queries
    portfolios: portfoliosQuery.data || [],
    isLoadingPortfolios: portfoliosQuery.isLoading,

    portfolio: portfolioDetailQuery.data,
    isLoadingPortfolio: portfolioDetailQuery.isLoading,
    refetchPortfolio: portfolioDetailQuery.refetch,

    publicPortfolio: publicPortfolioQuery.data,
    isLoadingPublicPortfolio: publicPortfolioQuery.isLoading,

    // Mutations
    createPortfolio: createPortfolioMutation.mutateAsync,
    isCreatingPortfolio: createPortfolioMutation.isPending,

    updatePortfolio: updatePortfolioMutation.mutateAsync,
    isUpdatingPortfolio: updatePortfolioMutation.isPending,

    deletePortfolio: deletePortfolioMutation.mutateAsync,
    isDeletingPortfolio: deletePortfolioMutation.isPending,
  };
}

export default usePortfolios;
