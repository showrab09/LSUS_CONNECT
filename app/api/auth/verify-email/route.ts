import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user by verification token
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.is_verified) {
      return NextResponse.json(
        { message: 'Email already verified' },
        { status: 200 }
      );
    }

    // Update user as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_verified: true,
        verification_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Email verified successfully! You can now sign in.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ADD THIS GET METHOD
export async function GET(request: NextRequest) {
  try {
    // Get token from URL query parameter
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user by verification token
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.is_verified) {
      return NextResponse.json(
        { message: 'Email already verified' },
        { status: 200 }
      );
    }

    // Update user as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_verified: true,
        verification_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Email verified successfully! You can now sign in.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}