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

// POST /api/user/notification-settings - Save notification preferences
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      email_new_messages,
      email_listing_updates,
      email_marketing,
      push_new_messages,
      push_listing_updates,
    } = body;

    // Create notification settings object
    const notificationSettings = {
      email_new_messages: email_new_messages ?? true,
      email_listing_updates: email_listing_updates ?? true,
      email_marketing: email_marketing ?? false,
      push_new_messages: push_new_messages ?? true,
      push_listing_updates: push_listing_updates ?? false,
    };

    // Update user's notification settings
    // Note: You may need to add a notification_settings JSONB column to users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ notification_settings: notificationSettings })
      .eq('id', user.userId);

    if (updateError) {
      console.error('Error updating notification settings:', updateError);
      return NextResponse.json(
        { error: 'Failed to update notification settings' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Notification settings updated successfully',
        settings: notificationSettings,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Update notification settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/user/notification-settings - Get notification preferences
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('notification_settings')
      .eq('id', user.userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Default settings if none exist
    const defaultSettings = {
      email_new_messages: true,
      email_listing_updates: true,
      email_marketing: false,
      push_new_messages: true,
      push_listing_updates: false,
    };

    return NextResponse.json(
      {
        settings: userData.notification_settings || defaultSettings,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get notification settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}