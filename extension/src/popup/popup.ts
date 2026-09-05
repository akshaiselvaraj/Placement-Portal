import { ExtensionStorage, StoredUserProfile } from '../shared/extension_users';
import { cookieHandler } from '../handlers/cookies';

const BACKEND_URL = 'http://localhost:5000';
const OFFICIAL_PS_PORTAL_URL = 'https://ps.bitsathy.ac.in/';

document.addEventListener('DOMContentLoaded', async () => {
  // Views
  const onboardingView = document.getElementById('onboarding-view') as HTMLDivElement;
  const mainView = document.getElementById('main-view') as HTMLDivElement;

  // Onboarding Form Elements
  const form = document.getElementById('onboarding-form') as HTMLFormElement;
  const inputName = document.getElementById('input-name') as HTMLInputElement;
  const inputEmail = document.getElementById('input-email') as HTMLInputElement;
  const checkboxConsent = document.getElementById('checkbox-consent') as HTMLInputElement;
  const btnRegister = document.getElementById('btn-register') as HTMLButtonElement;

  // Main View Elements
  const userNameEl = document.getElementById('user-name') as HTMLDivElement;
  const userEmailEl = document.getElementById('user-email') as HTMLDivElement;
  const userAvatarEl = document.getElementById('user-avatar-initials') as HTMLDivElement;
  const backendStatusEl = document.getElementById('backend-status') as HTMLSpanElement;
  const psCookieStatusEl = document.getElementById('ps-cookie-status') as HTMLSpanElement;
  const btnOpenPSPortal = document.getElementById('btn-open-ps-portal') as HTMLButtonElement;

  // Message Container
  const messageContainer = document.getElementById('message-container') as HTMLDivElement;

  const showMessage = (msg: string, isError = false) => {
    messageContainer.textContent = msg;
    messageContainer.className = `message-box ${isError ? 'error' : 'info'}`;
  };

  const hideMessage = () => {
    messageContainer.className = 'message-box hidden';
  };

  const validateOnboardingForm = (): boolean => {
    const nameVal = inputName.value.trim();
    const emailVal = inputEmail.value.trim();
    const isConsent = checkboxConsent.checked;
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

    if (!nameVal) {
      showMessage('Please enter your Full Name.', true);
      return false;
    }

    if (!emailVal || !isValidEmail) {
      showMessage('Please enter a valid email address (e.g. john@example.com).', true);
      return false;
    }

    if (!isConsent) {
      showMessage('Please check the privacy agreement checkbox to continue.', true);
      return false;
    }

    hideMessage();
    return true;
  };

  inputName.addEventListener('input', () => {
    if (inputName.value.trim().length > 0) hideMessage();
  });
  inputEmail.addEventListener('input', () => {
    if (inputEmail.value.trim().length > 0) hideMessage();
  });
  checkboxConsent.addEventListener('change', () => {
    if (checkboxConsent.checked) hideMessage();
  });

  const checkPSCookieStatus = async () => {
    if (!psCookieStatusEl) return;
    try {
      const cookie = await cookieHandler.getPSCookie();
      if (cookie) {
        psCookieStatusEl.textContent = 'Active (Captured)';
        psCookieStatusEl.className = 'status-val badge badge-connected';
      } else {
        psCookieStatusEl.textContent = 'Missing (Log into PS)';
        psCookieStatusEl.className = 'status-val badge badge-disconnected';
      }
    } catch {
      psCookieStatusEl.textContent = 'Missing (Log into PS)';
      psCookieStatusEl.className = 'status-val badge badge-disconnected';
    }
  };

  const showMainView = async (profile: StoredUserProfile) => {
    onboardingView.classList.add('hidden');
    mainView.classList.remove('hidden');

    userNameEl.textContent = profile.fullName;
    userEmailEl.textContent = profile.email;

    const initials = profile.fullName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0].toUpperCase())
      .slice(0, 2)
      .join('');
    userAvatarEl.textContent = initials || 'US';

    // Check backend status
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`);
      if (res.ok) {
        backendStatusEl.textContent = 'Connected';
        backendStatusEl.className = 'status-val badge badge-connected';
      } else {
        backendStatusEl.textContent = 'Offline (Local Mode)';
        backendStatusEl.className = 'status-val badge badge-disconnected';
      }
    } catch {
      backendStatusEl.textContent = 'Offline (Local Mode)';
      backendStatusEl.className = 'status-val badge badge-disconnected';
    }

    // Check PS session cookie status
    await checkPSCookieStatus();

    // Log EXTENSION_OPENED activity if connected
    try {
      await fetch(`${BACKEND_URL}/api/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.userId,
          activityType: 'EXTENSION_OPENED',
          metadata: { timestamp: new Date().toISOString() },
        }),
      });
    } catch (err) {
      // Ignore network errors silently for activity logging
    }
  };

  let isSubmitting = false;

  const handleRegisterSubmit = async () => {
    if (isSubmitting) return;

    if (!validateOnboardingForm()) {
      return;
    }

    isSubmitting = true;
    const fullName = inputName.value.trim();
    const email = inputEmail.value.trim();
    const nowISO = new Date().toISOString();

    btnRegister.disabled = true;
    btnRegister.textContent = 'Processing Registration...';
    showMessage('Registering your profile details...', false);

    let profile: StoredUserProfile;

    try {
      const response = await fetch(`${BACKEND_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          consentAccepted: true,
          extensionVersion: '1.0.0',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        const registeredUser = data.data;
        profile = {
          userId: registeredUser.id,
          fullName: registeredUser.fullName,
          email: registeredUser.email,
          createdAt: registeredUser.createdAt || nowISO,
          updatedAt: registeredUser.updatedAt || nowISO,
          consentAccepted: registeredUser.consentAccepted ?? true,
          consentTimestamp: registeredUser.consentTimestamp || nowISO,
          extensionVersion: registeredUser.extensionVersion || '1.0.0',
        };
      } else {
        profile = {
          userId: `ext_${Date.now()}`,
          fullName,
          email,
          createdAt: nowISO,
          updatedAt: nowISO,
          consentAccepted: true,
          consentTimestamp: nowISO,
          extensionVersion: '1.0.0',
        };
      }
    } catch (err) {
      console.warn('Backend server registration offline, completing registration locally:', err);
      profile = {
        userId: `ext_${Date.now()}`,
        fullName,
        email,
        createdAt: nowISO,
        updatedAt: nowISO,
        consentAccepted: true,
        consentTimestamp: nowISO,
        extensionVersion: '1.0.0',
      };
    }

    try {
      await ExtensionStorage.setUserProfile(profile);
      hideMessage();
      await showMainView(profile);
    } catch (err) {
      console.error('Failed saving profile:', err);
      showMessage('Could not save profile locally. Please try again.', true);
    } finally {
      btnRegister.disabled = false;
      btnRegister.textContent = 'Register & Continue';
      isSubmitting = false;
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleRegisterSubmit();
  });

  btnRegister.addEventListener('click', (e) => {
    e.preventDefault();
    handleRegisterSubmit();
  });

  inputName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRegisterSubmit();
    }
  });

  inputEmail.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRegisterSubmit();
    }
  });

  // Open PS Portal Button Action
  btnOpenPSPortal.addEventListener('click', async () => {
    const profile = await ExtensionStorage.getUserProfile();
    if (profile) {
      try {
        await fetch(`${BACKEND_URL}/api/activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: profile.userId,
            activityType: 'PORTAL_OPEN_REQUESTED',
            metadata: { targetUrl: OFFICIAL_PS_PORTAL_URL },
          }),
        });
      } catch (err) {
        // Ignore network errors silently for activity logging
      }
    }

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ url: '*://*.bitsathy.ac.in/*' }, (tabs) => {
        if (tabs && tabs.length > 0 && tabs[0].id !== undefined) {
          chrome.tabs.update(tabs[0].id, { active: true });
          if (tabs[0].windowId !== undefined) {
            chrome.windows.update(tabs[0].windowId, { focused: true });
          }
        } else {
          chrome.tabs.create({ url: OFFICIAL_PS_PORTAL_URL, active: true });
        }
      });
    } else {
      window.open(OFFICIAL_PS_PORTAL_URL, '_blank');
    }

    setTimeout(checkPSCookieStatus, 1500);
    setTimeout(checkPSCookieStatus, 4000);
  });

  // Initial check on popup open
  const existingProfile = await ExtensionStorage.getUserProfile();
  if (existingProfile) {
    await showMainView(existingProfile);
  } else {
    onboardingView.classList.remove('hidden');
    mainView.classList.add('hidden');
  }
});
