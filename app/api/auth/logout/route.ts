import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );

  // Clear the HTTP-only cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  });

  return response;
}
