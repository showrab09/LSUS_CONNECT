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
  } catch (error) {
    return null;
  }
}

// GET /api/saved-listings/check?listing_id=xxx - Check if listing is saved
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { is_saved: false, saved_listing_id: null },
        { status: 200 }
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

    const { data, error } = await supabase
      .from('saved_listings')
      .select('id')
      .eq('user_id', user.userId)
      .eq('listing_id', listingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking saved listing:', error);
      return NextResponse.json(
        { error: 'Failed to check saved status' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        is_saved: !!data,
        saved_listing_id: data?.id || null,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Check saved listing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}