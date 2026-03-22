import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/jwt';
import { moderateFields } from '@/lib/moderation';

export const dynamic = 'force-dynamic';

// Helper function to verify JWT token
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

// GET /api/lost-found - Fetch all lost & found items
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'LOST' or 'FOUND'

    let query = supabase
      .from('lost_found')
      .select(`
        *,
        user:users(id, full_name, email, profile_picture)
      `)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    // Filter by type if provided
    if (type && (type === 'LOST' || type === 'FOUND')) {
      query = query.eq('type', type);
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('Error fetching lost & found items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch items' },
        { status: 500 }
      );
    }

    return NextResponse.json({ items }, { status: 200 });

  } catch (error) {
    console.error('Get lost & found error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/lost-found - Create lost or found item
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
      type, // 'LOST' or 'FOUND'
      title,
      description,
      category,
      location,
      images,
      contact_info,
    } = body;

    // Validate inputs
    const { sanitizeText, sanitizeMultiline, validateImages, validateLength } = await import('@/lib/validate');
    if (!type || (type !== 'LOST' && type !== 'FOUND')) {
      return NextResponse.json({ error: 'Type must be LOST or FOUND.' }, { status: 400 });
    }
    const titleCheck = validateLength(title, 'Title', 150);
    if (!titleCheck.valid) return NextResponse.json({ error: titleCheck.error }, { status: 400 });
    const descCheck = validateLength(description, 'Description', 2000);
    if (!descCheck.valid) return NextResponse.json({ error: descCheck.error }, { status: 400 });
    if (!location) return NextResponse.json({ error: 'Location is required.' }, { status: 400 });
    if (images) {
      const imgCheck = validateImages(images);
      if (!imgCheck.valid) return NextResponse.json({ error: imgCheck.error }, { status: 400 });
    }

    // Content moderation
    const modResult = moderateFields({ title: title || '', description: description || '', location: location || '' });
    if (modResult.flagged && modResult.severity === 'critical') {
      return NextResponse.json({
        error: 'Your content violates our community guidelines.',
        flagged: true,
        categories: modResult.categories,
      }, { status: 400 });
    }

    // Create lost/found item
    const { data: item, error } = await supabase
      .from('lost_found')
      .insert([
        {
          user_id: user.userId,
          type,
          title,
          description,
          category: category || 'Other',
          location,
          images: images || [],
          contact_info,
          status: 'ACTIVE',
        },
      ])
      .select(`
        *,
        user:users(id, full_name, email, profile_picture)
      `)
      .single();

    if (error) {
      console.error('Error creating lost/found item:', error);
      return NextResponse.json(
        { error: 'Failed to create item' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Item posted successfully',
        item,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create lost/found error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}