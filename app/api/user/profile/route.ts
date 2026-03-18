import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

// Verify JWT token and get user ID
async function verifyToken(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

// GET /api/user/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.userId)
      .single();

    if (profileError || !userProfile) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { user: userProfile },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/profile - Update user's profile
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { full_name, bio, location, profile_picture } = body;

    // Validate and sanitize inputs
    const { sanitizeText, sanitizeMultiline, validateLength, validateImages } = await import('@/lib/validate');
    if (full_name !== undefined) {
      const nameCheck = validateLength(full_name, 'Full name', 100, 2);
      if (!nameCheck.valid) return NextResponse.json({ error: nameCheck.error }, { status: 400 });
    }
    if (bio !== undefined && bio.length > 500) {
      return NextResponse.json({ error: 'Bio must be under 500 characters.' }, { status: 400 });
    }
    if (location !== undefined && location.length > 200) {
      return NextResponse.json({ error: 'Location must be under 200 characters.' }, { status: 400 });
    }
    if (profile_picture !== undefined && profile_picture !== null && profile_picture !== '') {
      const imgCheck = validateImages([profile_picture]);
      if (!imgCheck.valid) return NextResponse.json({ error: imgCheck.error }, { status: 400 });
    }

    // Prepare update data (only include fields that were provided)
    const updateData: any = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (profile_picture !== undefined) updateData.profile_picture = profile_picture;

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: updatedUser,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}