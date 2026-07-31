import { api } from '@/lib/axios';
import type { ApiResponse, Portfolio } from '@/types';

export const portfolioService = {
  getPortfolios: async (): Promise<Portfolio[]> => {
    const res = await api.get<ApiResponse<Portfolio[]>>('/portfolios');
    return res.data.data;
  },

  getPortfolioById: async (id: string): Promise<Portfolio> => {
    const res = await api.get<ApiResponse<Portfolio>>(`/portfolios/${id}`);
    return res.data.data;
  },

  getPortfolioBySlug: async (slug: string): Promise<Portfolio> => {
    const res = await api.get<ApiResponse<Portfolio>>(`/portfolios/public/${slug}`);
    return res.data.data;
  },

  createPortfolio: async (data: {
    themeId: string;
    title: string;
    slug: string;
    data: Record<string, any>;
    isPublished?: boolean;
  }): Promise<Portfolio> => {
    const res = await api.post<ApiResponse<Portfolio>>('/portfolios', data);
    return res.data.data;
  },

  updatePortfolio: async (
    id: string,
    data: {
      themeId?: string;
      title?: string;
      slug?: string;
      data?: Record<string, any>;
      isPublished?: boolean;
    }
  ): Promise<Portfolio> => {
    const res = await api.put<ApiResponse<Portfolio>>(`/portfolios/${id}`, data);
    return res.data.data;
  },

  deletePortfolio: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/portfolios/${id}`);
  },
};

export default portfolioService;
