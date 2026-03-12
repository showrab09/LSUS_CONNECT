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

// GET /api/listings/[id] - Get single listing details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params;

    const { data: listing, error } = await supabase
      .from('listings')
      .select(`
        *,
        user:users(id, full_name, email, profile_picture)
      `)
      .eq('id', listingId)
      .single();

    if (error || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { listing },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get listing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/listings/[id] - Update a listing
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { id: listingId } = await params;
    const body = await request.json();

    // Check if listing exists and belongs to user
    const { data: existingListing, error: fetchError } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', listingId)
      .single();

    if (fetchError || !existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (existingListing.user_id !== user.userId) {
      return NextResponse.json(
        { error: 'You can only edit your own listings' },
        { status: 403 }
      );
    }

    // Prepare update data (only include fields that were provided)
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.price_type !== undefined) updateData.price_type = body.price_type;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.status !== undefined) updateData.status = body.status;

    // Housing-specific fields
    if (body.listing_type !== undefined) updateData.listing_type = body.listing_type;
    if (body.monthly_rent !== undefined) updateData.monthly_rent = body.monthly_rent;
    if (body.location_type !== undefined) updateData.location_type = body.location_type;
    if (body.move_in_date !== undefined) updateData.move_in_date = body.move_in_date;
    if (body.lease_length !== undefined) updateData.lease_length = body.lease_length;
    if (body.bedrooms !== undefined) updateData.bedrooms = body.bedrooms;
    if (body.bathrooms !== undefined) updateData.bathrooms = body.bathrooms;
    if (body.utilities_included !== undefined) updateData.utilities_included = body.utilities_included;
    if (body.pets_allowed !== undefined) updateData.pets_allowed = body.pets_allowed;
    if (body.pet_details !== undefined) updateData.pet_details = body.pet_details;
    if (body.gender_preference !== undefined) updateData.gender_preference = body.gender_preference;
    if (body.smoking_allowed !== undefined) updateData.smoking_allowed = body.smoking_allowed;
    if (body.quiet_hours !== undefined) updateData.quiet_hours = body.quiet_hours;

    updateData.updated_at = new Date().toISOString();

    // Update listing
    const { data: updatedListing, error: updateError } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', listingId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating listing:', updateError);
      return NextResponse.json(
        { error: 'Failed to update listing' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        listing: updatedListing,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Update listing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/listings/[id] - Delete a listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { id: listingId } = await params;

    // Check if listing exists and belongs to user
    const { data: existingListing, error: fetchError } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', listingId)
      .single();

    if (fetchError || !existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (existingListing.user_id !== user.userId) {
      return NextResponse.json(
        { error: 'You can only delete your own listings' },
        { status: 403 }
      );
    }

    // Delete listing
    const { error: deleteError } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId);

    if (deleteError) {
      console.error('Error deleting listing:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete listing' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Listing deleted successfully',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Delete listing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}