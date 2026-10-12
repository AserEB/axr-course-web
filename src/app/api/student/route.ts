import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Get Student Data
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const { data: student, error } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', Number(userId))
    .single();

  if (error || !student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, student });
}

// Update Student Profile Data
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, full_name, phone, email, password_hash } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('students')
      .update({
        full_name: full_name?.trim(),
        phone: phone?.trim(),
        email: email?.trim()?.toLowerCase(),
        password_hash,
      })
      .eq('user_id', Number(user_id))
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, student: data });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}