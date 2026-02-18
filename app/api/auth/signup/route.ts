import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
export const dynamic = 'force-dynamic';
import { sendVerificationEmail } from '@/lib/email/resend';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();

    // Validate LSUS email
    if (!email.endsWith('@lsus.edu')) {
      return NextResponse.json(
        { error: 'Only @lsus.edu email addresses are allowed' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          full_name: fullName,
          password_hash: passwordHash,
          verification_token: verificationToken,
          is_verified: false,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

  await sendVerificationEmail(email, verificationToken);
    
    return NextResponse.json(
      {
        message: 'User created successfully. Please check your email to verify your account.',
        userId: newUser.id,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}