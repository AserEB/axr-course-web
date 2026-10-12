import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Get Admin Users List
export async function GET() {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, username, full_name, role, is_active, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, admins: data });
}

// Create New Assistant Admin
export async function POST(req: NextRequest) {
  try {
    const { username, password, fullName } = await req.json();

    if (!username || !password || !fullName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('admin_users')
      .insert([
        {
          username: username.trim(),
          password_hash: password,
          full_name: fullName.trim(),
          role: 'assistant',
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, admin: data });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}