import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

async function verifyAdminToken(request: NextRequest) {
  try {
    const token = request.cookies.get('adminToken')?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.isAdmin) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Re-enable before production
    // const admin = await verifyAdminToken(request);
    // if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Run all counts in parallel
    const [
      usersResult,
      listingsResult,
      postsResult,
      lostFoundResult,
      recentUsersResult,
      recentListingsResult,
    ] = await Promise.all([
      supabase.from('users').select('id, created_at', { count: 'exact' }),
      supabase.from('listings').select('id, status', { count: 'exact' }).eq('status', 'ACTIVE'),
      supabase.from('posts').select('id', { count: 'exact' }).eq('status', 'ACTIVE'),
      supabase.from('lost_found').select('id, type', { count: 'exact' }).eq('status', 'ACTIVE'),
      // Recent signups - last 7 days
      supabase.from('users')
        .select('id, full_name, email, created_at, is_verified')
        .order('created_at', { ascending: false })
        .limit(10),
      // Recent listings
      supabase.from('listings')
        .select('id, title, category, status, created_at, user:users(full_name)')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    // New signups in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newSignups } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo);

    return NextResponse.json({
      stats: {
        totalUsers: usersResult.count || 0,
        newSignups: newSignups || 0,
        activeListings: listingsResult.count || 0,
        activePosts: postsResult.count || 0,
        lostFoundItems: lostFoundResult.count || 0,
      },
      recentUsers: recentUsersResult.data || [],
      recentListings: recentListingsResult.data || [],
    }, { status: 200 });

  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
