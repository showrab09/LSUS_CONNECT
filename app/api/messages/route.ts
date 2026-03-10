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

// POST /api/messages - Send a message
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listing_id, message, conversation_id } = body;

    // Validate input
    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    let conversationId = conversation_id;

    // If no conversation_id provided, we need to create/find conversation
    if (!conversationId && listing_id) {
      // Get listing to find seller
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('user_id')
        .eq('id', listing_id)
        .single();

      if (listingError || !listing) {
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        );
      }

      // Check if user is trying to message themselves
      if (listing.user_id === user.userId) {
        return NextResponse.json(
          { error: 'You cannot message yourself' },
          { status: 400 }
        );
      }

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listing_id)
        .eq('buyer_id', user.userId)
        .eq('seller_id', listing.user_id)
        .single();

      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        // Create new conversation
        const { data: newConversation, error: conversationError } = await supabase
          .from('conversations')
          .insert([
            {
              listing_id: listing_id,
              buyer_id: user.userId,
              seller_id: listing.user_id,
              last_message: message.trim(),
              last_message_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (conversationError) {
          console.error('Error creating conversation:', conversationError);
          return NextResponse.json(
            { error: 'Failed to create conversation' },
            { status: 500 }
          );
        }

        conversationId = newConversation.id;
      }
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID or Listing ID required' },
        { status: 400 }
      );
    }

    // Insert message
    const { data: newMessage, error: messageError } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          sender_id: user.userId,
          message: message.trim(),
          is_read: false,
        },
      ])
      .select()
      .single();

    if (messageError) {
      console.error('Error creating message:', messageError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Update conversation's last_message and last_message_at
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        last_message: message.trim(),
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation:', updateError);
    }

    return NextResponse.json(
      {
        success: true,
        conversation_id: conversationId,
        message: {
          id: newMessage.id,
          message: newMessage.message,
          created_at: newMessage.created_at,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}