import type { JWTPayload } from '../types';

const TOKEN_KEY = 'plated_auth_token';

// Determine auth mode from env (defaults to 'oauth' for safety)
const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE || 'oauth').toString().toLowerCase();
const isMockAuthEnabled = (): boolean => AUTH_MODE === 'mock';

/**
 * Store JWT token in localStorage
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Retrieve JWT token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove JWT token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    // In mock mode, any token is considered valid; decode only if possible
    const payload = decodeToken(token);
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    // If token doesn't have exp field, assume it's valid (for mock tokens)
    if (!payload.exp || isMockAuthEnabled()) {
      return true;
    }
    return payload.exp > currentTime;
  } catch {
    // In mock mode, decoding may fail for simple placeholder tokens; treat as authenticated
    return isMockAuthEnabled() ? true : false;
  }
};

/**
 * Decode JWT token to get payload
 */
export const decodeToken = (token: string): JWTPayload => {
  // If token looks like a JWT (has 3 parts), parse as JWT
  if (token.split('.').length === 3) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  // Otherwise, attempt to treat token as base64-encoded JSON (used by mock login)
  try {
    const jsonPayload = atob(token);
    return JSON.parse(jsonPayload);
  } catch (e) {
    // As a last resort in mock mode, return minimal payload
    if (isMockAuthEnabled()) {
      return { email: 'mock@user.local', name: 'Mock User' } as unknown as JWTPayload;
    }
    throw e;
  }
};

/**
 * Get user information from JWT token
 */
export const getUserFromToken = (): JWTPayload | null => {
  const token = getToken();
  if (!token) return null;

  try {
    return decodeToken(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};
