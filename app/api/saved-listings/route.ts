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
  } catch (error) {
    return null;
  }
}

// GET /api/saved-listings - Get all saved listings
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { data: savedListings, error } = await supabase
      .from('saved_listings')
      .select(`
        id,
        created_at,
        listing:listings(
          id,
          title,
          description,
          price,
          price_type,
          category,
          condition,
          location,
          images,
          status,
          created_at
        )
      `)
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved listings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch saved listings' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { savedListings: savedListings || [] },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get saved listings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/saved-listings - Save a listing
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
    const { listing_id } = body;

    if (!listing_id) {
      return NextResponse.json(
        { error: 'listing_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('saved_listings')
      .insert([
        {
          user_id: user.userId,
          listing_id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving listing:', error);
      return NextResponse.json(
        { error: 'Failed to save listing' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        saved_listing: data,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Save listing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/saved-listings - Unsave a listing
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
    const listingId = searchParams.get('listing_id');

    if (!listingId) {
      return NextResponse.json(
        { error: 'listing_id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('saved_listings')
      .delete()
      .eq('user_id', user.userId)
      .eq('listing_id', listingId);

    if (error) {
      console.error('Error unsaving listing:', error);
      return NextResponse.json(
        { error: 'Failed to unsave listing' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );

  } catch (error) {
    console.error('Unsave listing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}