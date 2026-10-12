import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password, type } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Identifier and password are required' },
        { status: 400 }
      );
    }

    const cleanInput = identifier.trim();

    // 1. ADMIN AUTHENTICATION
    if (type === 'admin') {
      // Check fallback owner credentials
      if (cleanInput === 'AxRCourse' && password === 'AxR_Course_2026') {
        return NextResponse.json({
          success: true,
          user: { username: 'AxRCourse', role: 'owner', full_name: 'AxR Super Owner' },
        });
      }

      const { data: admin, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', cleanInput)
        .eq('is_active', true)
        .single();

      if (error || !admin || admin.password_hash !== password) {
        return NextResponse.json(
          { error: 'የተሳሳተ የአድሚን መግቢያ መረጃ ወይም አካውንቱ ታግዷል።' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: { username: admin.username, role: admin.role, full_name: admin.full_name },
      });
    }

    // 2. STUDENT AUTHENTICATION
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .or(`student_custom_id.ilike.${cleanInput},email.ilike.${cleanInput},phone.eq.${cleanInput}`)
      .single();

    if (error || !student || student.password_hash !== password) {
      return NextResponse.json(
        { error: 'የተሳሳተ የተማሪ Student ID/Email ወይም Password ነው።' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: student,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Auth failed' }, { status: 500 });
  }
}