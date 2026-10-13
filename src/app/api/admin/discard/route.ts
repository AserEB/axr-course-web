import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, reason, adminName, toEmail, studentName } = body;

    const studentId = userId || body.user_id;
    const discardReason = reason || body.adminMessage || body.reason;

    if (!studentId && !toEmail) {
      return NextResponse.json(
        { error: 'User ID or Email and reason are required' },
        { status: 400 }
      );
    }

    let studentData = null;

    // 1. Update Student status in DB if userId is provided
    if (studentId) {
      const { data, error } = await supabase
        .from('students')
        .update({
          status: 'Discard',
          admin_message: (discardReason || '').trim(),
          handled_by: adminName || 'Admin',
        })
        .eq('user_id', Number(studentId))
        .select()
        .single();

      if (error) {
        console.warn('Database update warning in discard route:', error.message);
      } else {
        studentData = data;
      }
    }

    // Determine target email & name
    const targetEmail = toEmail || studentData?.email;
    const targetName = studentName || studentData?.full_name || 'Student';

    // 2. Send email notification directly via Resend SDK on server
    if (targetEmail) {
      await resend.emails.send({
        from: 'AxR Academy <onboarding@resend.dev>',
        to: [targetEmail],
        subject: '⚠️ የ AxR Academy የምዝገባ መረጃ ማሳወቂያ',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #090d16; border-radius: 10px;">
            <h2 style="color: #f43f5e;">ሰላም ${targetName}፣</h2>
            <p style="color: #e2e8f0;">የላኩት የምዝገባ መረጃ ችግር ስለነበረበት ውድቅ ተደርጓል።</p>
            <div style="background-color: #1e1b2e; padding: 15px; border-left: 4px solid #f43f5e; margin: 15px 0; border-radius: 4px;">
              <p style="color: #fda4af; margin: 0;"><b>ምክንያት፦</b> ${discardReason || 'የተሳሳተ የክፍያ ደረሰኝ ወይም መረጃ።'}</p>
            </div>
            <p style="color: #cbd5e1;">እባክዎ መረጃውን አስተካክለው በድጋሚ ይመዝገቡ።</p>
            <p style="font-size: 12px; color: #64748b;">AxR Academy Support Team</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Student application discarded and notified.',
      student: studentData,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}