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

// GET /api/saved-listings - Get all saved listings for user
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Get saved listings with full listing details
    const { data: savedListings, error: savedError } = await supabase
      .from('saved_listings')
      .select(`
        id,
        created_at,
        listing_id,
        listings:listing_id (
          id,
          title,
          description,
          price,
          price_type,
          category,
          condition,
          location,
          images,
          tags,
          status,
          created_at,
          user_id
        )
      `)
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false });

    if (savedError) {
      console.error('Error fetching saved listings:', savedError);
      return NextResponse.json(
        { error: 'Failed to fetch saved listings' },
        { status: 500 }
      );
    }

    // Filter out inactive/deleted listings and format response
    const activeSavedListings = savedListings
      .filter(item => {
        const listing = Array.isArray(item.listings) ? item.listings[0] : item.listings;
        return listing && listing.status === 'ACTIVE';
      })
      .map(item => {
        const listing = Array.isArray(item.listings) ? item.listings[0] : item.listings;
        return {
          id: item.id,
          created_at: item.created_at,
          listing: listing,
        };
      });

    return NextResponse.json(
      { saved_listings: activeSavedListings },
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
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Check if listing exists
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id')
      .eq('id', listing_id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Try to save (will fail if already saved due to UNIQUE constraint)
    const { data: savedListing, error: saveError } = await supabase
      .from('saved_listings')
      .insert([
        {
          user_id: user.userId,
          listing_id: listing_id,
        },
      ])
      .select()
      .single();

    // If duplicate key error, fetch existing record
    if (saveError && saveError.code === '23505') {
      const { data: existing } = await supabase
        .from('saved_listings')
        .select('*')
        .eq('user_id', user.userId)
        .eq('listing_id', listing_id)
        .single();

      return NextResponse.json(
        {
          success: true,
          saved_listing: existing,
        },
        { status: 200 }
      );
    }

    if (saveError) {
      console.error('Error saving listing:', saveError);
      return NextResponse.json(
        { error: 'Failed to save listing' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        saved_listing: savedListing,
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

    const body = await request.json();
    const { listing_id } = body;

    if (!listing_id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Delete the saved listing
    const { error: deleteError } = await supabase
      .from('saved_listings')
      .delete()
      .eq('user_id', user.userId)
      .eq('listing_id', listing_id);

    if (deleteError) {
      console.error('Error unsaving listing:', deleteError);
      return NextResponse.json(
        { error: 'Failed to unsave listing' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Listing removed from favorites',
      },
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