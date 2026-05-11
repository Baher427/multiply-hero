'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

/**
 * useAuthGuard - Centralized auth guard hook
 * 
 * Replaces the duplicated auth-guard pattern in every protected page.
 * Uses router.replace() instead of router.push() to prevent back-button loops:
 * - If user is unauthenticated, they are redirected to /login with a redirect param
 * - The current page is NOT added to history (replace, not push)
 * - After login, the user is taken back to the intended page
 * - Pressing back from /login does NOT create an infinite redirect loop
 */
export function useAuthGuard(options?: { requiredRole?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();
  const redirectedRef = useRef(false);

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

  return {
    isAuthenticated,
    isLoading,
    user,
    // Reset redirect flag (useful if auth state changes)
    resetRedirect: () => { redirectedRef.current = false; },
  };
}

/**
 * useSmartBack - Smart back navigation hook
 * 
 * Provides a "go back" function that works correctly with browser history:
 * - If there's a previous page in history that isn't the current page, go back
 * - Otherwise, navigate to a fallback page (default: /dashboard)
 * - Handles edge cases like deep links and auth redirects
 */
export function useSmartBack(fallbackPath: string = '/dashboard') {
  const router = useRouter();
  const pathname = usePathname();
  const navigationHistoryRef = useRef<string[]>([]);

  // Track navigation history
  useEffect(() => {
    navigationHistoryRef.current.push(pathname);
    // Keep only last 20 entries
    if (navigationHistoryRef.current.length > 20) {
      navigationHistoryRef.current = navigationHistoryRef.current.slice(-20);
    }
  }, [pathname]);

  const goBack = useCallback(() => {
    // Check if there's meaningful history to go back to
    const history = navigationHistoryRef.current;
    
    // If we have a previous page in our tracked history that's different from current
    if (history.length >= 2) {
      const previousPage = history[history.length - 2];
      // Don't go back to login page (would create a loop after auth)
      if (previousPage !== pathname && !previousPage.startsWith('/login')) {
        router.back();
        return;
      }
    }

    // Check if the browser has history (referral from same origin)
    // This handles the case where our tracked history is empty (page refresh)
    if (typeof window !== 'undefined' && window.history.length > 1) {
      // Use the Navigation API or performance entries to check if we can go back
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const hasPreviousPage = navEntries.length > 0 && navEntries[0].type !== 'navigate';
      
      if (hasPreviousPage || window.history.length > 2) {
        router.back();
        return;
      }
    }

    // Fallback: navigate to the specified fallback path
    router.push(fallbackPath);
  }, [router, pathname, fallbackPath]);

  return { goBack };
}

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
  }, [router]);

  return { navigateAfterAuth };
}

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
    // Use replace so protected page is removed from history
    router.replace('/');
  }, [router]);

  return { navigateAfterLogout };
}
