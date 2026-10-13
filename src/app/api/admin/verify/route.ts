import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, entranceLink, adminName, toEmail, studentName, customId } = body;

    const studentId = userId || body.user_id;
    const link = entranceLink || body.admin_message || body.adminMessage;

    if (!studentId && !toEmail) {
      return NextResponse.json(
        { error: 'User ID or Email and entrance link are required' },
        { status: 400 }
      );
    }

    let studentData = null;

    // 1. Update Student status in DB if studentId is provided
    if (studentId) {
      const { data, error } = await supabase
        .from('students')
        .update({
          status: 'Verified',
          admin_message: (link || '').trim(),
          handled_by: adminName || 'Admin',
        })
        .eq('user_id', Number(studentId))
        .select()
        .single();

      if (error) {
        console.warn('Database update warning in verify route:', error.message);
      } else {
        studentData = data;
      }
    }

    // Determine target email & info
    const targetEmail = toEmail || studentData?.email;
    const targetName = studentName || studentData?.full_name || 'Student';
    const targetCustomId = customId || studentData?.student_custom_id || `STU-${studentId}`;

    // 2. Send email notification directly via Resend SDK on server
    if (targetEmail) {
      await resend.emails.send({
        from: 'AxR Academy <onboarding@resend.dev>',
        to: [targetEmail],
        subject: '🎉 እንኳን ደስ አለዎት! የ AxR Academy ኮርስ ምዝገባዎ ተረጋገጠ',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #090d16; border-radius: 10px;">
            <h2 style="color: #38bdf8;">እንኳን ደስ አለዎት ${targetName}!</h2>
            <p style="color: #e2e8f0;">የክፍያ ማረጋገጫዎ ተቀባይነት አግኝቷል። የኮርሱ አባልነትዎ በስኬት ተረጋግጧል።</p>
            <p style="color: #cbd5e1;">የተማሪ መታወቂያዎ፦ <b style="color: #38bdf8;">${targetCustomId}</b></p>
            <div style="margin: 25px 0;">
              <a href="${link || '#'}" style="background-color: #10b981; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px;">ወደ ቴሌግራም ግሩፕ ግባ (Join Group)</a>
            </div>
            <p style="font-size: 12px; color: #64748b;">AxR Academy - Cyber Obsidian Portal</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Student successfully verified and notified.',
      student: studentData,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}