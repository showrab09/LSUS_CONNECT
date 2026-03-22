import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/jwt';

// All pages that require authentication
const protectedRoutes = [
  '/home',
  '/post-listing',
  '/marketplace',
  '/housing',
  '/social',
  '/lost-found',
  '/user-profile',
  '/messages',
  '/admin-dashboard',
  '/product-detail',
  '/contact-team',
  '/settings',
  '/report-lost-found',
];

// Pages that should redirect to /home if already logged in
const authRoutes = ['/signin', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie
  const token = request.cookies.get('token')?.value;

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Protected route with no token — redirect to signin
  if (isProtectedRoute && !token) {
    const url = new URL('/signin', request.url);
    url.searchParams.set('redirect', pathname); // remember where they were going
    return NextResponse.redirect(url);
  }

  // Protected route with token — verify it's valid
  if (isProtectedRoute && token) {
    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      // Token expired or invalid — clear it and redirect to signin
      const url = new URL('/signin', request.url);
      const response = NextResponse.redirect(url);
      response.cookies.set('token', '', { maxAge: 0, path: '/' });
      return response;
    }
  }

  // Auth route with valid token — redirect to home
  if (isAuthRoute && token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.redirect(new URL('/home', request.url));
    } catch {
      // Token invalid, allow access to signin/signup
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};