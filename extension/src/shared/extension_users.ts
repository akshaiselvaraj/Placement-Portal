export interface StoredUserProfile {
  userId: string;
  fullName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  consentAccepted: boolean;
  consentTimestamp: string;
  extensionVersion: string;
}

export const ExtensionStorage = {
  async getUserProfile(): Promise<StoredUserProfile | null> {
    return new Promise((resolve) => {
      try {
        if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
          chrome.storage.local.get(['sessionScopeProfile'], (result) => {
            resolve(result?.sessionScopeProfile || null);
          });
          return;
        }
      } catch (e) {
        console.warn('chrome.storage error, falling back to localStorage:', e);
      }

      try {
        const raw = localStorage.getItem('sessionScopeProfile');
        resolve(raw ? JSON.parse(raw) : null);
      } catch {
        resolve(null);
      }
    });
  },

  async setUserProfile(profile: StoredUserProfile): Promise<void> {
    return new Promise((resolve) => {
      try {
        if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
          chrome.storage.local.set({ sessionScopeProfile: profile }, () => {
            resolve();
          });
          return;
        }
      } catch (e) {
        console.warn('chrome.storage set error, falling back to localStorage:', e);
      }

      try {
        localStorage.setItem('sessionScopeProfile', JSON.stringify(profile));
      } catch (e) {
        console.warn('localStorage set error:', e);
      }
      resolve();
    });
  },
};
