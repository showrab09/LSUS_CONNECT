import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

async function verifyToken(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

// GET /api/messages/conversations - Get all conversations for current user
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Get all conversations where user is buyer or seller
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        created_at,
        updated_at,
        listing:listings(id, title, price, price_type, images),
        buyer:users!conversations_buyer_id_fkey(id, full_name, profile_picture),
        seller:users!conversations_seller_id_fkey(id, full_name, profile_picture)
      `)
      .or(`buyer_id.eq.${user.userId},seller_id.eq.${user.userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    // For each conversation, get the last message and unread count
    const conversationsWithDetails = await Promise.all(
      (conversations || []).map(async (conv: any) => {
        // Get last message
        const { data: lastMessageData } = await supabase
          .from('messages')
          .select('message, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get unread count (messages not sent by current user that are unread)
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', user.userId);

        // Determine the other user
        const isUserBuyer = conv.buyer?.id === user.userId;
        const otherUser = isUserBuyer ? conv.seller : conv.buyer;

        return {
          id: conv.id,
          listing: {
            id: conv.listing?.id,
            title: conv.listing?.title,
            price: conv.listing?.price,
            price_type: conv.listing?.price_type,
            images: conv.listing?.images || [],
          },
          other_user: {
            id: otherUser?.id,
            name: otherUser?.full_name || 'Unknown User',
            profile_picture: otherUser?.profile_picture || null,
          },
          last_message: lastMessageData?.message || 'No messages yet',
          last_message_at: lastMessageData?.created_at || conv.created_at,
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
