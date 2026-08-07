import { connectHandler } from './connect';
import { ExtensionResponse } from '../shared/types';

export const syncHandler = {
  /**
   * Securely orchestrates synchronizing PS data.
   * Maps to connectHandler as they currently share the /api/ps/connect endpoint,
   * but isolated for future expansion (e.g. /api/ps/sync).
   */
  handleSync: async (backendUrl: string, token: string): Promise<ExtensionResponse> => {
    return connectHandler.handleConnect(backendUrl, token);
  },
};
export default syncHandler;
