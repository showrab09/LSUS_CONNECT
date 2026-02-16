import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate LSUS email
    if (!email.endsWith('@lsus.edu')) {
      return NextResponse.json(
        { error: 'Only @lsus.edu email addresses are allowed' },
        { status: 400 }
      );
    }

    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    // Don't reveal if user exists or not (security best practice)
    if (error || !user) {
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive a password reset link.' },
        { status: 200 }
      );
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      );
    }

    // TODO: Send reset password email
    // For now, we'll just return the token (in production, you'd email this)
    console.log('Reset Token:', resetToken);
    console.log('Reset Link:', `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`);

    return NextResponse.json(
      { 
        message: 'If an account exists with this email, you will receive a password reset link.',
        // Remove this in production - only for testing
        resetToken: resetToken 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}