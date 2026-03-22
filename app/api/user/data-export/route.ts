import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

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

// POST /api/user/data-export - Request data export
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's listings
    const { data: listings } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.userId);

    // Get user's messages (as sender)
    const { data: sentMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('sender_id', user.userId);

    // Get user's conversations
    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .or(`buyer_id.eq.${user.userId},seller_id.eq.${user.userId}`);

    // Get saved listings
    const { data: savedListings } = await supabase
      .from('saved_listings')
      .select('*')
      .eq('user_id', user.userId);

    // Remove sensitive data
    const sanitizedUser = { ...userData };
    delete sanitizedUser.password;

    // Compile all data
    const exportData = {
      user: sanitizedUser,
      listings: listings || [],
      messages: sentMessages || [],
      conversations: conversations || [],
      saved_listings: savedListings || [],
      export_date: new Date().toISOString(),
    };

    // In production, you'd send this via email
    // For now, return it directly
    return NextResponse.json(
      {
        success: true,
        message: 'Data export generated successfully',
        data: exportData,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}