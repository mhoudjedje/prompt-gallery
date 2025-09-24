/**
 * Centralized redirect utilities for consistent navigation behavior
 */

export const REDIRECT_PATHS = {
  LANDING: '/',
  HOME: '/home',
  LOGIN: '/login',
  PROFILE: '/profile',
} as const;

/**
 * Determines the appropriate redirect path based on authentication status
 */
export function getRedirectPath(isAuthenticated: boolean, currentPath?: string): string {
  if (isAuthenticated) {
    // If authenticated, redirect to home unless already on a valid authenticated page
    const validAuthenticatedPaths = [REDIRECT_PATHS.HOME, REDIRECT_PATHS.PROFILE, '/contributor'];
    if (currentPath && validAuthenticatedPaths.some(path => currentPath.startsWith(path))) {
      return currentPath; // Stay on current page if it's valid
    }
    return REDIRECT_PATHS.HOME;
  } else {
    // If not authenticated, redirect to landing page
    return REDIRECT_PATHS.LANDING;
  }
}

/**
 * Determines if a path requires authentication
 */
export function requiresAuthentication(path: string): boolean {
  const protectedPaths = [REDIRECT_PATHS.HOME, REDIRECT_PATHS.PROFILE, '/contributor'];
  return protectedPaths.some(protectedPath => path.startsWith(protectedPath));
}

/**
 * Determines if a path is a public page (doesn't require authentication)
 */
export function isPublicPage(path: string): boolean {
  const publicPaths = [REDIRECT_PATHS.LANDING, REDIRECT_PATHS.LOGIN, '/signup'];
  return publicPaths.some(publicPath => path === publicPath || path.startsWith(publicPath));
}

/**
 * Validates redirect consistency between client and server
 */
export function validateRedirectConsistency(
  isAuthenticated: boolean,
  currentPath: string,
  targetPath: string
): boolean {
  if (isAuthenticated) {
    // Authenticated users should not be redirected to login or landing
    return !targetPath.includes('/login') && targetPath !== REDIRECT_PATHS.LANDING;
  } else {
    // Non-authenticated users should not be redirected to protected pages
    return !requiresAuthentication(targetPath);
  }
}

/**
 * Gets the appropriate logo click destination based on auth status
 */
export function getLogoClickDestination(isAuthenticated: boolean): string {
  return isAuthenticated ? REDIRECT_PATHS.HOME : REDIRECT_PATHS.LANDING;
}

/**
 * Gets the appropriate logout destination
 */
export function getLogoutDestination(): string {
  return REDIRECT_PATHS.LOGIN;
}