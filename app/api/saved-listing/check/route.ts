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

// GET /api/saved-listings/check?listing_id=uuid - Check if listing is saved
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Get listing_id from query params
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listing_id');

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Check if saved
    const { data: savedListing, error } = await supabase
      .from('saved_listings')
      .select('id')
      .eq('user_id', user.userId)
      .eq('listing_id', listingId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking saved status:', error);
      return NextResponse.json(
        { error: 'Failed to check saved status' },
        { status: 500 }
      );
    }

    if (savedListing) {
      return NextResponse.json(
        {
          is_saved: true,
          saved_listing_id: savedListing.id,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          is_saved: false,
        },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('Check saved status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}