import { ExtensionResponse } from './types';

export const psApi = {
  connectPS: async (
    backendUrl: string,
    token: string,
    cookieValue: string
  ): Promise<ExtensionResponse> => {
    try {
      const response = await fetch(`${backendUrl}/ps/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-PS-Session': cookieValue,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Failed to sync with placement portal.',
        };
      }

      return {
        success: true,
        message: data.message || 'Successfully connected PS account.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error communicating with placement backend.',
      };
    }
  },
};
export default psApi;
