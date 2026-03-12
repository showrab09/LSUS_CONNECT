import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

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

// POST /api/messages - Create conversation and send first message
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
    const { listing_id, message, conversation_id } = body;

    // --- Case 1: Sending a message to an existing conversation ---
    if (conversation_id) {
      if (!message?.trim()) {
        return NextResponse.json(
          { error: 'Message is required' },
          { status: 400 }
        );
      }

      // Verify user is part of this conversation
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .select('id, buyer_id, seller_id')
        .eq('id', conversation_id)
        .single();

      if (convError || !conv) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      if (conv.buyer_id !== user.userId && conv.seller_id !== user.userId) {
        return NextResponse.json(
          { error: 'You are not part of this conversation' },
          { status: 403 }
        );
      }

      // Insert message
      const { data: newMessage, error: msgError } = await supabase
        .from('messages')
        .insert([{
          conversation_id,
          sender_id: user.userId,
          message: message.trim(),
          is_read: false,
        }])
        .select()
        .single();

      if (msgError) {
        console.error('Error sending message:', msgError);
        return NextResponse.json(
          { error: 'Failed to send message' },
          { status: 500 }
        );
      }

      // Update conversation updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation_id);

      return NextResponse.json(
        { success: true, message: newMessage, conversation_id },
        { status: 201 }
      );
    }

    // --- Case 2: Starting a new conversation ---
    if (!listing_id) {
      return NextResponse.json(
        { error: 'listing_id is required to start a conversation' },
        { status: 400 }
      );
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get listing to find the seller
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, user_id, title')
      .eq('id', listing_id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Prevent messaging yourself
    if (listing.user_id === user.userId) {
      return NextResponse.json(
        { error: 'You cannot message yourself' },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listing_id)
      .eq('buyer_id', user.userId)
      .eq('seller_id', listing.user_id)
      .single();

    let conversationIdToUse: string;

    if (existingConv) {
      // Use existing conversation
      conversationIdToUse = existingConv.id;
    } else {
      // Create new conversation
      const { data: newConv, error: convCreateError } = await supabase
        .from('conversations')
        .insert([{
          listing_id,
          buyer_id: user.userId,
          seller_id: listing.user_id,
        }])
        .select()
        .single();

      if (convCreateError || !newConv) {
        console.error('Error creating conversation:', convCreateError);
        return NextResponse.json(
          { error: 'Failed to create conversation' },
          { status: 500 }
        );
      }

      conversationIdToUse = newConv.id;
    }

    // Send the message
    const { data: newMessage, error: msgError } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationIdToUse,
        sender_id: user.userId,
        message: message.trim(),
        is_read: false,
      }])
      .select()
      .single();

    if (msgError) {
      console.error('Error sending message:', msgError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Update conversation updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationIdToUse);

    return NextResponse.json(
      {
        success: true,
        message: newMessage,
        conversation_id: conversationIdToUse,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
