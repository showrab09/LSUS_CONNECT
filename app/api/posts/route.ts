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

// GET /api/posts - Fetch all active social posts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('user_id');

    let query = supabase
      .from('posts')
      .select(`
        *,
        user:users(id, full_name, email, profile_picture)
      `)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by user if user_id param provided
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { posts: posts || [] },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new social post
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
    const { content, location, images } = body;

    // Validate required fields
    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Post content is required' },
        { status: 400 }
      );
    }

    if (content.trim().length > 1000) {
      return NextResponse.json(
        { error: 'Post content cannot exceed 1000 characters' },
        { status: 400 }
      );
    }

    // Create the post
    const { data: post, error } = await supabase
      .from('posts')
      .insert([{
        user_id: user.userId,
        content: content.trim(),
        location: location?.trim() || null,
        images: images || [],
        post_type: 'social',
        status: 'ACTIVE',
      }])
      .select(`
        *,
        user:users(id, full_name, email, profile_picture)
      `)
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        post,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts?id=xxx - Delete a post (own posts only)
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (existingPost.user_id !== user.userId) {
      return NextResponse.json(
        { error: 'You can only delete your own posts' },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (deleteError) {
      console.error('Error deleting post:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );

  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}