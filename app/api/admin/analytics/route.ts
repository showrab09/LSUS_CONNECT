import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      usersResult,
      newUsersResult,
      listingsResult,
      postsResult,
      lostFoundResult,
      recentUsersResult,
      recentListingsResult,
      recentPostsResult,
      recentLostFoundResult,
      flaggedListingsResult,
    ] = await Promise.all([
      // Total users
      supabase.from('users').select('id', { count: 'exact', head: true }),
      // New users last 7 days
      supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
      // Active listings
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      // Active posts
      supabase.from('posts').select('id', { count: 'exact', head: true }),
      // Lost & found
      supabase.from('lost_found').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      // Recent users
      supabase.from('users')
        .select('id, full_name, email, is_verified, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
      // Recent listings
      supabase.from('listings')
        .select('id, title, category, status, created_at, user:users(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(20),
      // Recent posts
      supabase.from('posts')
        .select('id, content, created_at, user:users(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(20),
      // Recent lost & found
      supabase.from('lost_found')
        .select('id, title, type, status, created_at, user:users(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(10),
      // Flagged/reported listings (status = FLAGGED or REPORTED if exists, else just get all for moderation)
      supabase.from('listings')
        .select('id, title, category, status, created_at, user:users(full_name, email)')
        .in('status', ['FLAGGED', 'REPORTED', 'PENDING'])
        .limit(10),
    ]);

    // Daily signups for last 7 days for traffic chart
    const dailySignups = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const end = new Date(Date.now() - (i - 1) * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', start.toISOString())
        .lt('created_at', end.toISOString());
      dailySignups.push({
        date: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: count || 0,
      });
    }

    return NextResponse.json({
      stats: {
        totalUsers: usersResult.count || 0,
        newSignups: newUsersResult.count || 0,
        activeListings: listingsResult.count || 0,
        activePosts: postsResult.count || 0,
        lostFoundItems: lostFoundResult.count || 0,
        flaggedItems: flaggedListingsResult.data?.length || 0,
      },
      recentUsers: recentUsersResult.data || [],
      recentListings: recentListingsResult.data || [],
      recentPosts: recentPostsResult.data || [],
      recentLostFound: recentLostFoundResult.data || [],
      flaggedItems: flaggedListingsResult.data || [],
      dailySignups,
    }, { status: 200 });

  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
