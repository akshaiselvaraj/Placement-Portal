import type { ExtensionMessage, ExtensionResponse } from '../shared/types';
import { connectHandler } from '../handlers/connect';
import { syncHandler } from '../handlers/sync';
import { cookieHandler } from '../handlers/cookies';

const MESSAGE_TYPES = {
  CONNECT_PS: 'CONNECT_PS',
  SYNC_PS: 'SYNC_PS',
  CHECK_LOGIN: 'CHECK_LOGIN',
  GET_STATUS: 'GET_STATUS',
} as const;

// Extension Install Logger
chrome.runtime.onInstalled.addListener(() => {
  console.log('BIT PS Connector extension installed successfully.');
});

// Main Message Listener
chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ExtensionResponse) => void
  ) => {
    // Check sender/source if needed, but message verification will happen on backend
    const type = message.type;

    if (type === MESSAGE_TYPES.CONNECT_PS) {
      const { backendUrl, token } = message.data || {};
      if (!backendUrl || !token) {
        sendResponse({ success: false, message: 'Invalid payload: backendUrl and token are required.' });
        return false;
      }
      
      connectHandler.handleConnect(backendUrl, token)
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, message: err.message }));
      return true; // Keep message port open for async response
    }

    if (type === MESSAGE_TYPES.SYNC_PS) {
      const { backendUrl, token } = message.data || {};
      if (!backendUrl || !token) {
        sendResponse({ success: false, message: 'Invalid payload: backendUrl and token are required.' });
        return false;
      }

      syncHandler.handleSync(backendUrl, token)
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, message: err.message }));
      return true;
    }

    if (type === MESSAGE_TYPES.CHECK_LOGIN) {
      cookieHandler.getPSCookie()
        .then(cookie => {
          sendResponse({
            success: true,
            message: cookie ? 'Logged into PS.' : 'Not logged into PS.',
            data: { loggedInToPS: !!cookie },
          });
        })
        .catch(err => sendResponse({ success: false, message: err.message }));
      return true;
    }

    if (type === MESSAGE_TYPES.GET_STATUS) {
      cookieHandler.getPSCookie()
        .then(cookie => {
          sendResponse({
            success: true,
            message: 'Status retrieved.',
            data: {
              loggedInToPS: !!cookie,
              // Never expose cookie value itself!
            },
          });
        })
        .catch(err => sendResponse({ success: false, message: err.message }));
      return true;
    }

    // Default fallback
    sendResponse({ success: false, message: `Unknown request type: ${type}` });
    return false;
  }
);
