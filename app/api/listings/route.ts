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
      // Housing-specific fields
      listing_type,
      monthly_rent,
      location_type,
      move_in_date,
      lease_length,
      bedrooms,
      bathrooms,
      utilities_included,
      pets_allowed,
      pet_details,
      gender_preference,
      smoking_allowed,
      quiet_hours,
    } = body;

    // Validate inputs
    const { validateListing, sanitizeText, sanitizeMultiline } = await import('@/lib/validate');
    const validation = validateListing(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    // Sanitize text fields
    const cleanTitle = sanitizeText(title);
    const cleanDescription = sanitizeMultiline(description);

    // Create listing object
    const listingData: any = {
      user_id: user.userId,
      title: cleanTitle,
      description: cleanDescription,
      category,
      location,
      images: images || [],
      tags: tags || [],
      status: 'ACTIVE',
    };

    // Handle pricing - different for housing vs regular items
    if (category === 'Housing') {
      listingData.price = monthly_rent ? parseFloat(monthly_rent) : 0;
      listingData.price_type = 'PAID';
      listingData.monthly_rent = monthly_rent ? parseFloat(monthly_rent) : null;
      
      // Add all housing-specific fields
      listingData.listing_type = listing_type || null;
      listingData.location_type = location_type || null;
      listingData.move_in_date = move_in_date || null;
      listingData.lease_length = lease_length || null;
      listingData.bedrooms = bedrooms || null;
      listingData.bathrooms = bathrooms || null;
      listingData.utilities_included = utilities_included || null;
      listingData.pets_allowed = pets_allowed || null;
      listingData.pet_details = pet_details || null;
      listingData.gender_preference = gender_preference || null;
      listingData.smoking_allowed = smoking_allowed || null;
      listingData.quiet_hours = quiet_hours || null;
      
      // Condition not applicable for housing
      listingData.condition = null;
    } else {
      // Regular item listing
      listingData.price = price_type === 'PAID' ? parseFloat(price) : 0;
      listingData.price_type = price_type || 'PAID';
      listingData.condition = condition || null;
      
      // Set housing fields to null for non-housing items
      listingData.listing_type = null;
      listingData.monthly_rent = null;
      listingData.location_type = null;
      listingData.move_in_date = null;
      listingData.lease_length = null;
      listingData.bedrooms = null;
      listingData.bathrooms = null;
      listingData.utilities_included = null;
      listingData.pets_allowed = null;
      listingData.pet_details = null;
      listingData.gender_preference = null;
      listingData.smoking_allowed = null;
      listingData.quiet_hours = null;
    }

    // Create listing
    const { data: listing, error } = await supabase
      .from('listings')
      .insert([listingData])
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