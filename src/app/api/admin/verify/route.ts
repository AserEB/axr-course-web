import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { sendStudentStatusEmail } from '@/lib/resendEmail';

export async function POST(req: NextRequest) {
  try {
    const { userId, entranceLink, adminName } = await req.json();

    if (!userId || !entranceLink) {
      return NextResponse.json(
        { error: 'User ID and entrance link are required' },
        { status: 400 }
      );
    }

    // 1. Update Student status in DB
    const { data: student, error } = await supabase
      .from('students')
      .update({
        status: 'Verified',
        admin_message: entranceLink.trim(),
        handled_by: adminName || 'Admin',
      })
      .eq('user_id', Number(userId))
      .select()
      .single();

    if (error || !student) {
      return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 400 });
    }

    // 2. Send email notification via Resend API
    if (student.email) {
      await sendStudentStatusEmail({
        toEmail: student.email,
        studentName: student.full_name,
        customId: student.student_custom_id || `STU-${student.user_id}`,
        status: 'Verified',
        entranceLink: entranceLink.trim(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Student successfully verified and notified.',
      student,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}