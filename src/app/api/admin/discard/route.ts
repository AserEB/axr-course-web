import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { sendStudentStatusEmail } from '@/lib/resendEmail';

export async function POST(req: NextRequest) {
  try {
    const { userId, reason, adminName } = await req.json();

    if (!userId || !reason) {
      return NextResponse.json(
        { error: 'User ID and discard reason are required' },
        { status: 400 }
      );
    }

    // 1. Update Student status in DB
    const { data: student, error } = await supabase
      .from('students')
      .update({
        status: 'Discard',
        admin_message: reason.trim(),
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
        status: 'Discard',
        adminMessage: reason.trim(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Student application discarded and notified.',
      student,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}