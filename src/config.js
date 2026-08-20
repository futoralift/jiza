// ======================================================
// JIZA JEWELLERY STUDIO — API CONFIG & ADMIN AUTH CLIENT
// ======================================================

const isBrowser = typeof window !== 'undefined';
const isDevServer = isBrowser && (
  window.location.port === '5173' || 
  window.location.port === '3000' || 
  window.location.port === '3001' || 
  window.location.port === '3002' ||
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
);

// In production (e.g. jizajewellerystudio.com or any non-dev port),
// API requests route through Nginx reverse proxy using relative URL '' (/api/...).
// In local development, fallback to local Express server on port 5000.
export const API_BASE = (
  (import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL)) ||
  (isDevServer ? `http://${window.location.hostname}:5000` : '')
).replace(/\/$/, '');

export const ADMIN_TOKEN_KEY = 'jiza_admin_token';
export const ADMIN_ROUTE_KEY = 'jiza_admin_route';
export const ACTIVE_VIEW_KEY = 'jiza_active_view';

/**
 * Safely retrieve stored Admin JWT token across localStorage and sessionStorage.
 */
export function getAdminToken() {
  if (!isBrowser) return '';
  try {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
    if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
      return '';
    }
    return token.trim();
  } catch (e) {
    return '';
  }
}

/**
 * Persist Admin JWT token into both storages for seamless refresh and tab continuity.
 */
export function setAdminTokenStorage(token) {
  if (!token || !isBrowser) return;
  try {
    const trimmed = String(token).trim();
    localStorage.setItem(ADMIN_TOKEN_KEY, trimmed);
    sessionStorage.setItem(ADMIN_TOKEN_KEY, trimmed);
    localStorage.setItem(ADMIN_ROUTE_KEY, 'true');
    sessionStorage.setItem(ADMIN_ROUTE_KEY, 'true');
  } catch (e) {
    console.warn('Failed to persist admin token in storage:', e);
  }
}

/**
 * Clear Admin authentication tokens and state on logout or session expiration.
 */
export function clearAdminTokenStorage() {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_ROUTE_KEY);
    sessionStorage.removeItem(ADMIN_ROUTE_KEY);
  } catch (e) {}
}

/**
 * Centralized API Fetcher that automatically attaches:
 * - Authorization: Bearer <admin JWT token>
 * - Content-Type: application/json (for JSON payloads)
 * - Standardized error detection & 401 Unauthorized event dispatch
 */
export async function adminFetch(endpoint, options = {}) {
  const token = getAdminToken();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://') 
    ? endpoint 
    : `${API_BASE}${cleanEndpoint}`;
  
  const headers = {
    ...((options.body && !(options.body instanceof FormData)) ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    console.warn(`[ADMIN AUTH 401] Unauthorized on ${url}`);
    if (isBrowser) {
      window.dispatchEvent(new CustomEvent('jiza:admin:unauthorized', { detail: { url, status: 401 } }));
    }
  }

  return response;
}
