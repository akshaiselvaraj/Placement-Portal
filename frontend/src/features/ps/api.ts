import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types';
import type { SyncPSDataPayload, PSStatusData } from './types';

export const psApi = {
  connectPS: async (data: SyncPSDataPayload): Promise<void> => {
    await api.post<ApiResponse<null>>('/ps/connect', data);
  },

  getPSMe: async (): Promise<PSStatusData> => {
    const res = await api.get<ApiResponse<PSStatusData>>('/ps/me');
    return res.data.data;
  },

  pushPSData: async (): Promise<PSStatusData> => {
    const res = await api.post<ApiResponse<PSStatusData>>('/ps/push');
    return res.data.data;
  },

  disconnectPS: async (): Promise<void> => {
    await api.post<ApiResponse<null>>('/ps/disconnect');
  },
};
export default psApi;
