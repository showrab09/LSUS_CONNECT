import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// DELETE /api/admin/listings?id=xxx - Admin delete any listing
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });

    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });

    return NextResponse.json({ message: 'Listing deleted' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
