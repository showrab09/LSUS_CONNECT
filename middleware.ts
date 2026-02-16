import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

// Pages that require authentication
const protectedRoutes = [
  '/post-listing',
  '/marketplace',
  '/lost-found',
  '/user-profile',
  '/admin-dashboard',
  '/product-detail',
  '/contact-team',
];

// Pages that should redirect to home if already logged in
const authRoutes = ['/signin', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookie or localStorage (we'll use cookie for server-side)
  const token = request.cookies.get('token')?.value;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if it's an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If accessing protected route without token, redirect to signin
  if (isProtectedRoute && !token) {
    const url = new URL('/signin', request.url);
    return NextResponse.redirect(url);
  }

  // If accessing auth route with valid token, redirect to home
  if (isAuthRoute && token) {
    try {
      // Verify token is valid
      await jwtVerify(token, JWT_SECRET);
      const url = new URL('/post-listing', request.url);
      return NextResponse.redirect(url);
    } catch (error) {
      // Token invalid, allow access to auth page
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};