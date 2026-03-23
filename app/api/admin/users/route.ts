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

async function logAudit(adminId: string, action: string, details: string) {
  await supabase.from('admin_audit_log').insert([{
    admin_id: adminId,
    action,
    details,
    created_at: new Date().toISOString(),
  }]).match(() => {});
}

// GET /api/admin/users - List all users (top_level + mid_level)
export async function GET(request: NextRequest) {
  try {
    // TODO: Re-enable before production
    // const admin = await verifyAdminToken(request);
    // if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';

    let query = supabase
      .from('users')
      .select('id, full_name, email, is_verified, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query;

    if (error) return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });

    return NextResponse.json({ users: users || [], total: count || 0, page, limit }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/users - Change user role (top_level only)
export async function PATCH(request: NextRequest) {
  try {
    // TODO: Re-enable before production
    const admin = { userId: 'dev', role: 'top_level' };

    const { userId, role } = await request.json();
    const validRoles = ['user', 'moderator', 'mid_level', 'top_level'];

    if (!userId || !role || !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid userId or role' }, { status: 400 });
    }

    // Prevent changing your own role
    if (userId === admin.userId) {
      return NextResponse.json({ error: 'You cannot change your own role' }, { status: 400 });
    }

    const { error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });

    await logAudit(admin.userId as string, 'role_change', `Changed user ${userId} role to ${role}`);

    return NextResponse.json({ message: 'Role updated successfully' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/users - Delete a user (top_level only)
export async function DELETE(request: NextRequest) {
  try {
    // TODO: Re-enable before production
    const admin = { userId: 'dev', role: 'top_level' };

    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

    // Prevent deleting yourself
    if (userId === admin.userId) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    // Prevent deleting other top-level admins
    const { data: targetUser } = await supabase.from('users').select('role').eq('id', userId).single();
    if (targetUser?.role === 'top_level') {
      return NextResponse.json({ error: 'Cannot delete another top-level admin' }, { status: 403 });
    }

    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });

    await logAudit(admin.userId as string, 'user_deleted', `Deleted user ${userId}`);

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
