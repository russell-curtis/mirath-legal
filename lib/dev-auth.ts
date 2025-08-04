/**
 * Development Authentication Utilities
 * Provides mock authentication for development mode
 */

export interface MockUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockSession {
  user: MockUser;
  token: string;
  expires: Date;
}

// Mock user for development
export const DEV_USER: MockUser = {
  id: 'dev-user-001',
  name: 'John Developer',
  email: 'dev@mirath.legal',
  image: null,
  emailVerified: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date(),
};

// Mock session for development
export const DEV_SESSION: MockSession = {
  user: DEV_USER,
  token: 'dev-token-12345',
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
};

/**
 * Check if development mode is enabled
 */
export function isDevMode(): boolean {
  return process.env.DEV_MODE === 'true' || process.env.NODE_ENV === 'development';
}

/**
 * Get development session if in dev mode
 */
export function getDevSession(): MockSession | null {
  return isDevMode() ? DEV_SESSION : null;
}

/**
 * Mock authentication check for development
 */
export async function getDevAuth(): Promise<{ user: MockUser; session: MockSession } | null> {
  if (!isDevMode()) {
    return null;
  }

  return {
    user: DEV_USER,
    session: DEV_SESSION,
  };
}