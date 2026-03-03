import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { randomBytes } from 'crypto';
import { sendVerificationEmail } from '@/lib/email/resend';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.trim())
      .single();

    // Don't reveal if user exists or not (security best practice)
    if (error || !user) {
      return NextResponse.json(
        { message: 'If an account exists with this email, a verification email will be sent.' },
        { status: 200 }
      );
    }

    // Check if already verified
    if (user.is_verified) {
      return NextResponse.json(
        { message: 'This account is already verified. You can sign in now.' },
        { status: 200 }
      );
    }

    // Generate new verification token
    const verificationToken = randomBytes(32).toString('hex');

    // Update user with new token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        verification_token: verificationToken,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      );
    }

    // Send verification email
    await sendVerificationEmail(email.trim(), verificationToken);

    return NextResponse.json(
      { message: 'Verification email sent! Please check your inbox.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
