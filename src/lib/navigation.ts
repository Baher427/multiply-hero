'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

// ─── Global Navigation History Tracker ──────────────────────────────────────
// Tracks navigation across ALL pages (not per-component like a ref would be).
// This is essential for useSmartBack to know where the user came from
// even after page transitions remount components.

const GLOBAL_NAV_HISTORY: string[] = [];
const MAX_HISTORY = 30;

// Pages that should be skipped when going back
// (auth redirects, login page — we don't want back button to return here)
const SKIP_BACK_PATHS = ['/login', '/register'];

if (typeof window !== 'undefined') {
  // Initialize with current pathname on first load
  const initialPath = window.location.pathname;
  if (GLOBAL_NAV_HISTORY.length === 0 && initialPath) {
    GLOBAL_NAV_HISTORY.push(initialPath);
  }

  // Listen for popstate events (browser back/forward buttons)
  // to keep our tracker in sync with actual browser history
  window.addEventListener('popstate', () => {
    const currentPath = window.location.pathname;
    const lastEntry = GLOBAL_NAV_HISTORY[GLOBAL_NAV_HISTORY.length - 1];
    if (currentPath !== lastEntry) {
      // Browser navigated via back/forward - update our tracker
      // Check if we went back (current path matches a previous entry)
      const existingIndex = GLOBAL_NAV_HISTORY.lastIndexOf(currentPath);
      if (existingIndex >= 0) {
        // Went back to an existing entry - trim everything after it
        GLOBAL_NAV_HISTORY.length = existingIndex + 1;
      } else {
        // Forward navigation to a new page
        GLOBAL_NAV_HISTORY.push(currentPath);
        if (GLOBAL_NAV_HISTORY.length > MAX_HISTORY) {
          GLOBAL_NAV_HISTORY.shift();
        }
      }
    }
  });
}

/**
 * Track a navigation entry in the global history
 */
function trackNavigation(pathname: string) {
  const lastEntry = GLOBAL_NAV_HISTORY[GLOBAL_NAV_HISTORY.length - 1];
  if (pathname !== lastEntry) {
    GLOBAL_NAV_HISTORY.push(pathname);
    if (GLOBAL_NAV_HISTORY.length > MAX_HISTORY) {
      GLOBAL_NAV_HISTORY.shift();
    }
  }
}

/**
 * Get the previous page from global history (skipping auth pages)
 */
function getPreviousPage(currentPath: string): string | null {
  // Walk backwards through history to find a valid previous page
  for (let i = GLOBAL_NAV_HISTORY.length - 2; i >= 0; i--) {
    const page = GLOBAL_NAV_HISTORY[i];
    if (page !== currentPath && !SKIP_BACK_PATHS.some(p => page.startsWith(p))) {
      return page;
    }
  }
  return null;
}

// ─── useAuthGuard ────────────────────────────────────────────────────────────

/**
 * useAuthGuard - Centralized auth guard hook
 * 
 * Replaces the duplicated auth-guard pattern in every protected page.
 * Uses router.replace() instead of router.push() to prevent back-button loops:
 * - If user is unauthenticated, they are redirected to /login with a redirect param
 * - The current page is NOT added to history (replace, not push)
 * - After login, the user is taken back to the intended page
 * - Pressing back from /login does NOT create an infinite redirect loop
 * 
 * Returns the full auth context (user, selectedChild, etc.) so components
 * don't need to call useAuth() separately.
 */
export function useAuthGuard(options?: { requiredRole?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();
  const { isAuthenticated, isLoading, user } = auth;
  const redirectedRef = useRef(false);

  // Track this page in global navigation history
  useEffect(() => {
    trackNavigation(pathname);
  }, [pathname]);

  useEffect(() => {
    // Don't redirect while auth is still loading
    if (isLoading) return;

    // Already redirected this session - prevent double-redirect
    if (redirectedRef.current) return;

    // Not authenticated → redirect to login with return path
    if (!isAuthenticated) {
      redirectedRef.current = true;
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
      return;
    }

    // Role-based access check
    if (options?.requiredRole && user?.role !== options.requiredRole) {
      // For parent pages, also allow admin
      if (options.requiredRole === 'parent' && user?.role === 'admin') {
        return; // Admin can access parent pages
      }
      redirectedRef.current = true;
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, user, pathname, router, options?.requiredRole]);

  // Reset redirect flag when auth state changes to authenticated
  useEffect(() => {
    if (isAuthenticated) {
      redirectedRef.current = false;
    }
  }, [isAuthenticated]);

  return {
    ...auth, // Pass through all auth context (user, selectedChild, setSelectedChild, etc.)
    isAuthenticated,
    isLoading,
    user,
    resetRedirect: () => { redirectedRef.current = false; },
  };
}

// ─── useSmartBack ────────────────────────────────────────────────────────────

/**
 * useSmartBack - Smart back navigation hook
 * 
 * Provides a "go back" function that works correctly with browser history:
 * - Uses the global navigation tracker to find the previous page
 * - Falls back to router.back() when browser has history
 * - Ultimate fallback to a specified path (e.g., /dashboard)
 * - Handles edge cases like deep links and auth redirects
 * - Never goes back to login/register pages
 */
export function useSmartBack(fallbackPath: string = '/dashboard') {
  const router = useRouter();
  const pathname = usePathname();

  const goBack = useCallback(() => {
    // Strategy 1: Check our global navigation tracker for a valid previous page
    const previousPage = getPreviousPage(pathname);
    
    if (previousPage) {
      // We have a tracked previous page - use browser back to preserve history stack
      // The popstate listener will keep our tracker in sync
      router.back();
      return;
    }

    // Strategy 2: Check if the browser has meaningful history
    if (typeof window !== 'undefined' && window.history.length > 1) {
      // Browser has history entries - try going back
      // This handles cases where our tracker may have been reset (page refresh)
      router.back();
      return;
    }

    // Strategy 3: Fallback - navigate to the specified fallback path
    // This handles deep links where there's no history at all
    router.push(fallbackPath);
  }, [router, pathname, fallbackPath]);

  return { goBack };
}

// ─── usePostAuthNavigation ───────────────────────────────────────────────────

/**
 * usePostAuthNavigation - Handles navigation after login/register
 * 
 * Uses router.replace() so that after login/register:
 * - The login/register page is NOT in the browser history
 * - Pressing back from dashboard does NOT return to login
 * - The user's intended destination (from ?redirect param) is respected
 */
export function usePostAuthNavigation() {
  const router = useRouter();

  const navigateAfterAuth = useCallback((redirectPath?: string) => {
    const target = redirectPath || '/dashboard';
    // Use replace so login/register page is not in history
    router.replace(target);
    // Track the destination in our global history
    trackNavigation(target);
  }, [router]);

  return { navigateAfterAuth };
}

// ─── useLogoutNavigation ─────────────────────────────────────────────────────

/**
 * useLogoutNavigation - Handles navigation after logout
 * 
 * Uses router.replace() so that after logout:
 * - The protected page the user was on is NOT in history
 * - Pressing back does NOT return to the protected page
 * - User goes to home page cleanly
 */
export function useLogoutNavigation() {
  const router = useRouter();

  const navigateAfterLogout = useCallback(() => {
    // Clear our global navigation history on logout
    // so user can't navigate back to protected pages
    GLOBAL_NAV_HISTORY.length = 0;
    GLOBAL_NAV_HISTORY.push('/');
    
    // Use replace so protected page is removed from history
    router.replace('/');
  }, [router]);

  return { navigateAfterLogout };
}

// ─── Debug utility (dev only) ────────────────────────────────────────────────

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__navHistory = GLOBAL_NAV_HISTORY;
}
