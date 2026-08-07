import { cookieHandler } from './cookies';
import { psApi } from '../shared/api';
import { ExtensionResponse } from '../shared/types';

export const connectHandler = {
  /**
   * Securely orchestrates connecting PS account.
   * Fetches the cookie, calls backend API, and immediately discards cookie references.
   */
  handleConnect: async (backendUrl: string, token: string): Promise<ExtensionResponse> => {
    let cookieValue: string | null = null;
    try {
      cookieValue = await cookieHandler.getPSCookie();
      if (!cookieValue) {
        return {
          success: false,
          message: 'Cookie missing. Please ensure you are logged into https://ps.bitsathy.ac.in',
        };
      }

      // Forward request to placement backend API
      const result = await psApi.connectPS(backendUrl, token, cookieValue);
      return result;
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'An unexpected error occurred during synchronization.',
      };
    } finally {
      // Security: immediately wipe the cookie value from memory
      cookieValue = null;
    }
  },
};
export default connectHandler;
