import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

// Helper function to verify JWT token
async function verifyToken(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

// GET /api/listings - Fetch all listings
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering (optional)
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'ACTIVE';

    // Build query
    let query = supabase
      .from('listings')
      .select(`
        *,
        user:users(id, full_name, email, profile_picture)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    // Add category filter if provided
    if (category && category !== 'All Categories') {
      query = query.eq('category', category);
    }

    const { data: listings, error } = await query;

    if (error) {
      console.error('Error fetching listings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch listings' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { listings },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get listings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/listings - Create new listing
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await verifyToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      price_type,
      category,
      condition,
      location,
      images,
      tags,
    } = body;

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    // Create listing
    const { data: listing, error } = await supabase
      .from('listings')
      .insert([
        {
          user_id: user.userId,
          title,
          description,
          price: price_type === 'PAID' ? parseFloat(price) : 0,
          price_type: price_type || 'PAID',
          category,
          condition,
          location,
          images: images || [],
          tags: tags || [],
          status: 'ACTIVE',
        },
      ])
      .select(`
        *,
        user:users(id, full_name, email, profile_picture)
      `)
      .single();

    if (error) {
      console.error('Error creating listing:', error);
      return NextResponse.json(
        { error: 'Failed to create listing' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Listing created successfully',
        listing,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
