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

/**
 * Safely format upload media URLs (images and videos) for development and production.
 */
export function getMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const clean = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return API_BASE ? `${API_BASE}${clean}` : clean;
  }
  return trimmed;
}

export const ADMIN_TOKEN_KEY = 'jiza_admin_token';
export const ADMIN_ROLE_KEY = 'jiza_admin_role';
export const ADMIN_EMAIL_KEY = 'jiza_admin_email';
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
 * Retrieve Admin role (SUPER_ADMIN vs SUPER_READONLY_ADMIN).
 */
export function getAdminRole() {
  if (!isBrowser) return '';
  try {
    const role = localStorage.getItem(ADMIN_ROLE_KEY) || sessionStorage.getItem(ADMIN_ROLE_KEY) || '';
    if (role) return role;
    
    // Fallback: decode role from stored JWT token payload
    const token = getAdminToken();
    if (token && token.includes('.')) {
      try {
        const payloadBase64 = token.split('.')[1];
        const decoded = JSON.parse(atob(payloadBase64));
        if (decoded?.role) return decoded.role;
      } catch (_) {}
    }
    return 'SUPER_ADMIN';
  } catch (e) {
    return 'SUPER_ADMIN';
  }
}

/**
 * Check if the active admin session is read-only (Agency / Viewer).
 */
export function isReadOnlyAdmin() {
  return getAdminRole() === 'SUPER_READONLY_ADMIN';
}

/**
 * Retrieve Admin Email.
 */
export function getAdminEmail() {
  if (!isBrowser) return '';
  try {
    const email = localStorage.getItem(ADMIN_EMAIL_KEY) || sessionStorage.getItem(ADMIN_EMAIL_KEY) || '';
    if (email) return email;

    const token = getAdminToken();
    if (token && token.includes('.')) {
      try {
        const payloadBase64 = token.split('.')[1];
        const decoded = JSON.parse(atob(payloadBase64));
        if (decoded?.email) return decoded.email;
      } catch (_) {}
    }
    return '';
  } catch (e) {
    return '';
  }
}

/**
 * Persist Admin JWT token and metadata into both storages for seamless refresh and tab continuity.
 */
export function setAdminTokenStorage(token, role, email) {
  if (!token || !isBrowser) return;
  try {
    const trimmed = String(token).trim();
    localStorage.setItem(ADMIN_TOKEN_KEY, trimmed);
    sessionStorage.setItem(ADMIN_TOKEN_KEY, trimmed);
    localStorage.setItem(ADMIN_ROUTE_KEY, 'true');
    sessionStorage.setItem(ADMIN_ROUTE_KEY, 'true');

    let resolvedRole = role;
    let resolvedEmail = email;

    if (!resolvedRole || !resolvedEmail) {
      if (trimmed.includes('.')) {
        try {
          const payload = JSON.parse(atob(trimmed.split('.')[1]));
          resolvedRole = resolvedRole || payload.role;
          resolvedEmail = resolvedEmail || payload.email;
        } catch (_) {}
      }
    }

    if (resolvedRole) {
      localStorage.setItem(ADMIN_ROLE_KEY, resolvedRole);
      sessionStorage.setItem(ADMIN_ROLE_KEY, resolvedRole);
    }
    if (resolvedEmail) {
      localStorage.setItem(ADMIN_EMAIL_KEY, resolvedEmail);
      sessionStorage.setItem(ADMIN_EMAIL_KEY, resolvedEmail);
    }
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
    localStorage.removeItem(ADMIN_ROLE_KEY);
    sessionStorage.removeItem(ADMIN_ROLE_KEY);
    localStorage.removeItem(ADMIN_EMAIL_KEY);
    sessionStorage.removeItem(ADMIN_EMAIL_KEY);
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
    clearAdminTokenStorage();
    if (isBrowser) {
      window.dispatchEvent(new CustomEvent('jiza_admin_unauthorized'));
    }
  }

  return response;
}
