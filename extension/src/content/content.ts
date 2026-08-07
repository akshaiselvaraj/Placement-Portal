import type { ExtensionMessage } from '../shared/types';

// Set indicator on page DOM so React frontend can verify extension is active
document.documentElement.setAttribute('data-ps-extension-installed', 'true');

const MESSAGE_TYPES = {
  CONNECT_PS: 'CONNECT_PS',
  SYNC_PS: 'SYNC_PS',
} as const;

// Listen for messages from the Placement Portal React Page
window.addEventListener('message', (event) => {
  // Security check: only allow messages originating from the same page context
  if (event.source !== window) return;

  const message = event.data as ExtensionMessage;
  if (!message || message.source !== 'placement-portal') return;

  const type = message.type;
  
  if (type === MESSAGE_TYPES.CONNECT_PS || type === MESSAGE_TYPES.SYNC_PS) {
    // Resolve the appropriate backend URL based on the current origin
    const origin = window.location.origin;
    const backendUrl = origin.includes('localhost:5173')
      ? 'http://localhost:5000/api'
      : `${origin}/api`;

    // Forward request to background service worker
    chrome.runtime.sendMessage(
      {
        type,
        data: {
          backendUrl,
          token: message.data?.token,
        },
      },
      (response) => {
        // Send response back to the page context
        window.postMessage(
          {
            source: 'ps-extension',
            type: `${type}_RESPONSE`,
            data: response,
          },
          '*'
        );
      }
    );
  }
});

// Listen for messages sent from the extension popup to the content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'POPUP_TRIGGER_CONNECT') {
    window.postMessage({ source: 'ps-extension-popup', type: 'POPUP_CONNECT' }, '*');
    sendResponse({ success: true, message: 'Connect flow triggered in portal page.' });
  } else if (message.type === 'POPUP_TRIGGER_SYNC') {
    window.postMessage({ source: 'ps-extension-popup', type: 'POPUP_SYNC' }, '*');
    sendResponse({ success: true, message: 'Sync flow triggered in portal page.' });
  } else {
    sendResponse({ success: false, message: 'Unknown popup action type.' });
  }
  return false;
});

