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

// GET /api/comments?post_id=xxx OR ?listing_id=xxx OR ?lost_found_id=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('post_id');
    const listingId = searchParams.get('listing_id');
    const lostFoundId = searchParams.get('lost_found_id');

    if (!postId && !listingId && !lostFoundId) {
      return NextResponse.json(
        { error: 'One of post_id, listing_id, or lost_found_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('comments')
      .select(`
        *,
        user:users(id, full_name, email, profile_picture)
      `)
      .order('created_at', { ascending: true });

    if (postId) query = query.eq('post_id', postId);
    if (listingId) query = query.eq('listing_id', listingId);
    if (lostFoundId) query = query.eq('lost_found_id', lostFoundId);

    const { data: comments, error } = await query;

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comments: comments || [] }, { status: 200 });

  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/comments - Create a comment
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
    const { content, post_id, listing_id, lost_found_id } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (!post_id && !listing_id && !lost_found_id) {
      return NextResponse.json(
        { error: 'One of post_id, listing_id, or lost_found_id is required' },
        { status: 400 }
      );
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert([{
        user_id: user.userId,
        content: content.trim(),
        post_id: post_id || null,
        listing_id: listing_id || null,
        lost_found_id: lost_found_id || null,
      }])
      .select(`
        *,
        user:users(id, full_name, email, profile_picture)
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json(
        { error: 'Failed to post comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, comment }, { status: 201 });

  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/comments?id=xxx - Delete own comment
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const commentId = request.nextUrl.searchParams.get('id');
    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (existing.user_id !== user.userId) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
