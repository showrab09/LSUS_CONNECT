import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export const dynamic = 'force-dynamic';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // // Validate LSUS email
    // if (!email.endsWith('@lsus.edu')) {
    //   return NextResponse.json(
    //     { error: 'Only @lsus.edu email addresses are allowed' },
    //     { status: 400 }
    //   );
    // }

    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.is_verified) {
      return NextResponse.json(
        { error: 'Please verify your email before signing in' },
        { status: 403 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await new SignJWT({ 
      userId: user.id,
      email: user.email,
      name: user.full_name,  // ← ADD THIS LINE
      isAdmin: user.is_admin
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Create response with token as cookie
    const response = NextResponse.json(
      {
        message: 'Signin successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          profilePicture: user.profile_picture,
          bio: user.bio,
          isAdmin: user.is_admin,
        },
      },
      { status: 200 }
    );

    // Set token as HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}