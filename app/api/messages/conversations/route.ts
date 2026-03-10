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

// GET /api/messages/conversations - Get all conversations for user
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
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
      .select(`
        id,
        listing_id,
        buyer_id,
        seller_id,
        last_message,
        last_message_at,
        created_at,
        listings:listing_id (
          id,
          title,
          price,
          price_type,
          images
        )
      `)
      .or(`buyer_id.eq.${user.userId},seller_id.eq.${user.userId}`)
      .order('last_message_at', { ascending: false });

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    // For each conversation, get the other user's info and unread count
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        // Determine who is the "other user"
        const otherUserId = conversation.buyer_id === user.userId 
          ? conversation.seller_id 
          : conversation.buyer_id;

        // Get other user's info
        const { data: otherUser } = await supabase
          .from('users')
          .select('id, full_name, profile_picture')
          .eq('id', otherUserId)
          .single();

        // Count unread messages (messages sent by other user that current user hasn't read)
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conversation.id)
          .eq('sender_id', otherUserId)
          .eq('is_read', false);

        return {
          id: conversation.id,
          listing: {
            id: conversation.listings?.id || '',
            title: conversation.listings?.title || 'Listing',
            price: conversation.listings?.price || 0,
            images: conversation.listings?.images || [],
          },
          other_user: {
            id: otherUser?.id || '',
            name: otherUser?.full_name || 'User',
            profile_picture: otherUser?.profile_picture || '',
          },
          last_message: conversation.last_message || '',
          last_message_at: conversation.last_message_at,
          unread_count: unreadCount || 0,
        };
      })
    );

    return NextResponse.json(
      { conversations: conversationsWithDetails },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}