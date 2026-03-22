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

// GET /api/messages/conversations/[id] - Get single conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;

    // Get conversation details
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        created_at,
        listing:listings(id, title, price, price_type, images),
        buyer:users!conversations_buyer_id_fkey(id, full_name, profile_picture),
        seller:users!conversations_seller_id_fkey(id, full_name, profile_picture)
      `)
      .eq('id', conversationId)
      .single();

    if (convError || !conv) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Verify user is part of this conversation
    const buyerId = (conv.buyer as any)?.id;
    const sellerId = (conv.seller as any)?.id;

    if (buyerId !== user.userId && sellerId !== user.userId) {
      return NextResponse.json(
        { error: 'You are not part of this conversation' },
        { status: 403 }
      );
    }

    // Get all messages for this conversation
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        message,
        is_read,
        created_at,
        sender:users!messages_sender_id_fkey(id, full_name)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('Error fetching messages:', msgError);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Format conversation response
    const conversation = {
      id: conv.id,
      listing: {
        id: (conv.listing as any)?.id,
        title: (conv.listing as any)?.title,
        price: (conv.listing as any)?.price,
        price_type: (conv.listing as any)?.price_type,
        images: (conv.listing as any)?.images || [],
      },
      buyer: {
        id: buyerId,
        name: (conv.buyer as any)?.full_name || 'Unknown',
      },
      seller: {
        id: sellerId,
        name: (conv.seller as any)?.full_name || 'Unknown',
      },
    };

    // Format messages
    const formattedMessages = (messages || []).map((msg: any) => ({
      id: msg.id,
      sender_id: msg.sender_id,
      sender_name: msg.sender?.full_name || 'Unknown',
      message: msg.message,
      is_read: msg.is_read,
      created_at: msg.created_at,
    }));

    return NextResponse.json(
      { conversation, messages: formattedMessages },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
