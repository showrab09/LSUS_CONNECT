import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [listingsRes, postsRes, lostFoundRes] = await Promise.all([
      supabase.from('listings').select('category').eq('status', 'ACTIVE'),
      supabase.from('posts').select('id', { count: 'exact', head: true }),
      supabase.from('lost_found').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    ]);

    // Count listings by category
    const categoryCounts: Record<string, number> = {};
    (listingsRes.data || []).forEach((l: any) => {
      const cat = l.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categoryRoutes: Record<string, string> = {
      'Housing':     '/housing',
      'Books':       '/marketplace?category=Books',
      'Electronics': '/marketplace?category=Electronics',
      'Clothing':    '/marketplace?category=Clothing',
      'Furniture':   '/marketplace?category=Furniture',
      'Services':    '/marketplace?category=Services',
      'Tutoring':    '/marketplace?category=Tutoring',
      'Other':       '/marketplace',
    };

    const postCount = postsRes.count || 0;
    const lostFoundCount = lostFoundRes.count || 0;

    const trending = [
      ...Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([category, count]) => ({
          label: category,
          meta: count + ' listing' + (count !== 1 ? 's' : ''),
          href: categoryRoutes[category] || '/marketplace?category=' + encodeURIComponent(category),
        })),
      ...(postCount > 0 ? [{
        label: 'Social Posts',
        meta: postCount + ' post' + (postCount !== 1 ? 's' : ''),
        href: '/social',
      }] : []),
      ...(lostFoundCount > 0 ? [{
        label: 'Lost & Found',
        meta: lostFoundCount + ' item' + (lostFoundCount !== 1 ? 's' : ''),
        href: '/lost-found',
      }] : []),
    ]
    .sort((a, b) => parseInt(b.meta) - parseInt(a.meta))
    .slice(0, 3);

    return NextResponse.json({ trending }, { status: 200 });
  } catch (error) {
    console.error('Trending error:', error);
    return NextResponse.json({ trending: [] }, { status: 500 });
  }
}
