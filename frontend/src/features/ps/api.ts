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

  getLevelQuestions: async (levelId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const isInstalled = document.documentElement.getAttribute('data-ps-extension-installed') === 'true';
      
      const triggerFallback = async (fallbackSession: string) => {
        try {
          const res = await api.get<ApiResponse<any>>(`/ps/levels/${levelId}/questions`, {
            headers: { 'x-ps-session': fallbackSession }
          });
          resolve(res.data.data);
        } catch (err: any) {
          reject(err);
        }
      };

      if (!isInstalled) {
        // Fallback to mock session so developers can evaluate the UI without loading the extension
        console.warn('Extension not installed, falling back to mock session backend query.');
        triggerFallback('mock-active');
        return;
      }

      const token = localStorage.getItem('token') || '';
      
      const handleMessage = (event: MessageEvent) => {
        const message = event.data;
        if (!message) return;

        if (message.source === 'ps-extension' && message.type === 'GET_QUESTIONS_RESPONSE') {
          window.removeEventListener('message', handleMessage);
          const response = message.data;
          if (response && response.success) {
            resolve({
              available: response.available !== false,
              reason: response.reason || null,
              questions: response.questions || [],
            });
          } else {
            const msg = response?.message || '';
            if (msg.includes('Cookie missing') || msg.includes('ensure you are logged')) {
              reject(new Error('PS_NOT_LOGGED_IN'));
            } else {
              // Trigger fallback to allow simulating other states (like unregistered)
              const testSession = msg.includes('expired') ? 'mock-expired' : (msg.includes('register') ? 'mock-unregistered' : 'mock-active');
              triggerFallback(testSession);
            }
          }
        }
      };

      window.addEventListener('message', handleMessage);

      window.postMessage(
        {
          source: 'placement-portal',
          type: 'GET_QUESTIONS',
          data: { token, levelId },
        },
        '*'
      );

      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        triggerFallback('mock-active');
      }, 3500);
    });
  }
};
export default psApi;
