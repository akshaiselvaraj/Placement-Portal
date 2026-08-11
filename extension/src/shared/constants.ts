export const PORTAL_DOMAINS = {
  PS: 'ps.bitsathy.ac.in',
  PLACEMENT_LOCAL: 'localhost:5173',
  PLACEMENT_PROD: 'placement.bitsathy.ac.in',
  PLACEMENT_VERCEL: 'placement-portal-cyan.vercel.app',
};

export const PORTAL_URLS = {
  PS: 'https://ps.bitsathy.ac.in',
  PLACEMENT_LOCAL: 'http://localhost:5173',
  PLACEMENT_PROD: 'https://placement.bitsathy.ac.in',
  PLACEMENT_VERCEL: 'https://placement-portal-cyan.vercel.app',
};

export const MESSAGE_TYPES = {
  CONNECT_PS: 'CONNECT_PS',
  SYNC_PS: 'SYNC_PS',
  CHECK_LOGIN: 'CHECK_LOGIN',
  GET_STATUS: 'GET_STATUS',
  DISCONNECT: 'DISCONNECT',
  
  CONNECT_PS_RESPONSE: 'CONNECT_PS_RESPONSE',
  SYNC_PS_RESPONSE: 'SYNC_PS_RESPONSE',
  CHECK_LOGIN_RESPONSE: 'CHECK_LOGIN_RESPONSE',
  GET_STATUS_RESPONSE: 'GET_STATUS_RESPONSE',
  DISCONNECT_RESPONSE: 'DISCONNECT_RESPONSE',
} as const;

export const COOKIE_CONFIG = {
  NAME: 'PS',
  DOMAIN: 'ps.bitsathy.ac.in',
};
