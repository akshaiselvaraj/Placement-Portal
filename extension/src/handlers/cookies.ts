const COOKIE_CONFIG = {
  NAME: 'PS',
  DOMAIN: 'ps.bitsathy.ac.in',
};

export const cookieHandler = {
  /**
   * Securely reads only the 'PS' cookie from 'ps.bitsathy.ac.in'.
   * Never stores or logs the value.
   */
  getPSCookie: (): Promise<string | null> => {
    return new Promise((resolve) => {
      chrome.cookies.get(
        {
          url: `https://${COOKIE_CONFIG.DOMAIN}`,
          name: COOKIE_CONFIG.NAME,
        },
        (cookie) => {
          if (chrome.runtime.lastError) {
            resolve(null);
          } else if (cookie && cookie.value) {
            resolve(cookie.value);
          } else {
            resolve(null);
          }
        }
      );
    });
  },
};
export default cookieHandler;
