import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/register'];

// Route access by role
const ROUTE_ACCESS: Record<string, string[]> = {
  '/admin': ['admin'],
  '/parent': ['parent', 'admin'],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static files, API routes, and _next
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/avatars') ||
    pathname.startsWith('/worlds') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route);

  // Get token from cookie or authorization header
  const token = req.cookies.get('auth-token')?.value;

  if (!token) {
    // No token - redirect to login for protected routes
    if (!isPublicRoute) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Verify token
  const payload = await verifyToken(token);

  if (!payload) {
    // Invalid token - clear cookie and redirect to login
    if (!isPublicRoute) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth-token');
      return response;
    }
    const response = NextResponse.next();
    response.cookies.delete('auth-token');
    return response;
  }

  // Check role-based access
  for (const [route, allowedRoles] of Object.entries(ROUTE_ACCESS)) {
    if (pathname.startsWith(route) && !allowedRoles.includes(payload.role)) {
      // User doesn't have the right role - redirect to dashboard
      const dashboardUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Authenticated user trying to access login/register - redirect to dashboard
  if (isPublicRoute && pathname !== '/') {
    const dashboardUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (avatars, worlds, images)
     */
    '/((?!_next/static|_next/image|favicon.ico|avatars|worlds|images|logo.svg|robots.txt).*)',
  ],
};
