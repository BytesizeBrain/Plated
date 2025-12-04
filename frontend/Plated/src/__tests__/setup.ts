/**
 * Test Setup Configuration
 * 
 * This file configures the testing environment for the Plated frontend.
 * It sets up mocks, utilities, and global configurations needed for testing.
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Declare global types for test environment
declare global {
  var IntersectionObserver: typeof globalThis.IntersectionObserver;
  var ResizeObserver: typeof globalThis.ResizeObserver;
  var localStorage: Storage;
  var sessionStorage: Storage;
  var console: Console;
}

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
window.scrollTo = vi.fn() as typeof window.scrollTo;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock environment variables
vi.mock('import.meta.env', () => ({
  DEV: true,
  VITE_API_BASE_URL: 'http://localhost:5000',
}));

// Mock date-fns to have consistent timestamps in tests
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2 hours ago'),
  format: vi.fn(() => 'Dec 25, 2023'),
  isSameDay: vi.fn(() => false),
  isToday: vi.fn(() => false),
  isYesterday: vi.fn(() => false),
}));
