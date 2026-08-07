import type { ExtensionResponse } from '../shared/types';

const MESSAGE_TYPES = {
  CONNECT_PS: 'CONNECT_PS',
  SYNC_PS: 'SYNC_PS',
  CHECK_LOGIN: 'CHECK_LOGIN',
  GET_STATUS: 'GET_STATUS',
} as const;

document.addEventListener('DOMContentLoaded', () => {
  const statusBadge = document.getElementById('status-badge') as HTMLDivElement;
  const btnCheckLogin = document.getElementById('btn-check-login') as HTMLButtonElement;
  const btnConnect = document.getElementById('btn-connect') as HTMLButtonElement;
  const btnSync = document.getElementById('btn-sync') as HTMLButtonElement;
  const btnSettings = document.getElementById('btn-settings') as HTMLButtonElement;
  const messageContainer = document.getElementById('message-container') as HTMLDivElement;

  const showMessage = (msg: string, isError = false) => {
    messageContainer.textContent = msg;
    messageContainer.className = `message-box ${isError ? 'error' : 'info'}`;
  };

  const hideMessage = () => {
    messageContainer.className = 'message-box hidden';
  };

  const checkLoginStatus = () => {
    statusBadge.textContent = 'Checking...';
    statusBadge.className = 'badge';
    
    chrome.runtime.sendMessage(
      { type: MESSAGE_TYPES.CHECK_LOGIN },
      (response: ExtensionResponse<{ loggedInToPS: boolean }>) => {
        if (chrome.runtime.lastError) {
          statusBadge.textContent = 'Offline';
          statusBadge.className = 'badge badge-disconnected';
          showMessage('Failed to communicate with extension helper.', true);
          return;
        }

        if (response && response.success && response.data?.loggedInToPS) {
          statusBadge.textContent = '🟢 Connected';
          statusBadge.className = 'badge badge-connected';
          btnConnect.disabled = false;
          btnSync.disabled = false;
          hideMessage();
        } else {
          statusBadge.textContent = '🔴 Disconnected';
          statusBadge.className = 'badge badge-disconnected';
          btnConnect.disabled = true;
          btnSync.disabled = true;
          showMessage('Please log in to https://ps.bitsathy.ac.in to authorize sync.');
        }
      }
    );
  };

  const triggerActiveTabAction = (actionType: 'CONNECT' | 'SYNC') => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.id || !activeTab.url) {
        showMessage('No active browser tab found.', true);
        return;
      }

      const url = activeTab.url;
      const isPortal = url.includes('localhost:5173') || url.includes('placement.bitsathy.ac.in');

      if (!isPortal) {
        showMessage(
          'Please navigate to your Placement Portal dashboard tab and trigger connection from there.',
          true
        );
        return;
      }

      // Tell the active tab content script to trigger the connection/sync action
      chrome.tabs.sendMessage(
        activeTab.id,
        { type: actionType === 'CONNECT' ? 'POPUP_TRIGGER_CONNECT' : 'POPUP_TRIGGER_SYNC' },
        (res) => {
          if (chrome.runtime.lastError) {
            showMessage('Portal page is not responsive. Please refresh the page and try again.', true);
          } else if (res && res.success) {
            showMessage(res.message || 'Action triggered successfully.');
          } else {
            showMessage(res?.message || 'Failed to trigger portal page action.', true);
          }
        }
      );
    });
  };

  // Bind Events
  btnCheckLogin.addEventListener('click', checkLoginStatus);
  
  btnConnect.addEventListener('click', () => {
    triggerActiveTabAction('CONNECT');
  });

  btnSync.addEventListener('click', () => {
    triggerActiveTabAction('SYNC');
  });

  btnSettings.addEventListener('click', () => {
    showMessage('Developer settings are managed automatically.', false);
  });

  // Run initial check
  checkLoginStatus();
});
