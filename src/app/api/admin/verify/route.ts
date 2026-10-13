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

    // 2. Send branded email notification directly via Resend SDK on server (8ኛ)
    if (targetEmail) {
      await resend.emails.send({
        from: 'AxR Academy <onboarding@resend.dev>',
        to: [targetEmail],
        subject: '🎉 እንኳን ደስ አለዎት! የ AxR Academy ኮርስ ምዝገባዎ ተረጋገጠ',
        html: `
          <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 24px; color: #f8fafc; background-color: #090d16; border-radius: 16px; border: 1px solid #1e293b;">
            
            <!-- BRANDED LOGO HEADER -->
            <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #1e293b; margin-bottom: 20px;">
              <img src="https://aserproduction.tech/assets/images/axr-logo.png" alt="AxR Academy Logo" style="height: 55px; width: auto; display: inline-block;" />
              <p style="font-size: 11px; color: #38bdf8; font-weight: bold; font-family: monospace; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 8px;">AxR Cyber Obsidian Academy</p>
            </div>

            <!-- CONTENT BODY -->
            <h2 style="color: #38bdf8; font-size: 20px; font-weight: 800; margin-bottom: 12px;">እንኳን ደስ አለዎት ${targetName}!</h2>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
              የላኩት የክፍያ ማረጋገጫ በአድሚኖች ተገምግሞ ተቀባይነት አግኝቷል። የኮርሱ አባልነትዎ በስኬት ተረጋግጧል።
            </p>

            <div style="background-color: #0f172a; padding: 16px; border-radius: 12px; border: 1px solid #334155; margin-bottom: 24px;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; font-family: monospace;">የተማሪ መታወቂያ (Student ID)</p>
              <p style="color: #38bdf8; font-size: 22px; font-weight: 900; font-family: monospace; margin: 0;">${targetCustomId}</p>
            </div>

            <!-- CTA BUTTON -->
            <div style="text-align: center; margin: 28px 0;">
              <a href="${link || '#'}" style="background-color: #10b981; color: #022c22; padding: 14px 28px; text-decoration: none; font-weight: 900; font-size: 14px; border-radius: 10px; display: inline-block; box-shadow: 0 0 20px rgba(16,185,129,0.3);">
                ወደ ቴሌግራም ግሩፕ ግባ (Join Telegram Group) →
              </a>
            </div>

            <!-- FOOTER -->
            <div style="border-top: 1px solid #1e293b; pt: 16px; margin-top: 24px; text-align: center;">
              <p style="font-size: 11px; color: #64748b; margin: 0;">AxR Academy Support Team | Cyber Obsidian Portal</p>
            </div>

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