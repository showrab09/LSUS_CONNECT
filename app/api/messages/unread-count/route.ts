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

// GET /api/messages/unread-count - Get total unread messages
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Get all conversations where user is buyer OR seller
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('id, buyer_id, seller_id')
      .or(`buyer_id.eq.${user.userId},seller_id.eq.${user.userId}`);

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
      return NextResponse.json(
        { unread_count: 0 },
        { status: 200 }
      );
    }

    // Count unread messages across all conversations
    let totalUnread = 0;

    for (const conversation of conversations) {
      // Determine who is the "other user" (sender)
      const otherUserId = conversation.buyer_id === user.userId 
        ? conversation.seller_id 
        : conversation.buyer_id;

      // Count unread messages from other user in this conversation
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversation.id)
        .eq('sender_id', otherUserId)
        .eq('is_read', false);

      totalUnread += (count || 0);
    }

    return NextResponse.json(
      { unread_count: totalUnread },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get unread count error:', error);
    return NextResponse.json(
      { unread_count: 0 },
      { status: 200 }
    );
  }
}