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

    let emailSent = false;
    let emailError = null;

    // 2. Send branded email notification directly via Resend SDK
    if (targetEmail) {
      try {
        const emailResponse = await resend.emails.send({
          from: 'AxR Academy <info@aserproduction.tech>',
          to: [targetEmail],
          subject: '⚠️ የ AxR Academy የምዝገባ መረጃ ማሳወቂያ',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #f8fafc; background-color: #090d16; border-radius: 16px; border: 1px solid #1e293b;">
              
              <!-- BRANDED LOGO HEADER -->
              <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #1e293b; margin-bottom: 20px;">
                <img src="https://aserproduction.tech/assets/images/axr-logo.png" alt="AxR Academy Logo" style="height: 55px; width: auto; display: inline-block;" />
                <p style="font-size: 11px; color: #f43f5e; font-weight: bold; font-family: monospace; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 8px;">AxR Cyber Obsidian Academy</p>
              </div>

              <!-- CONTENT BODY -->
              <h2 style="color: #f43f5e; font-size: 20px; font-weight: 800; margin-bottom: 12px;">ሰላም ${targetName}፣</h2>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
                የላኩት የምዝገባ መረጃ ችግር ስለነበረበት በውድቅነት ተስተናግዷል።
              </p>

              <div style="background-color: #1e1b2e; padding: 18px; border-radius: 12px; border-left: 4px solid #f43f5e; margin-bottom: 24px;">
                <p style="color: #fda4af; font-size: 12px; font-weight: bold; margin: 0 0 6px 0; text-transform: uppercase; font-family: monospace;">የውድቅ መደረጊያ ምክንያት (Reason)</p>
                <p style="color: #f1f5f9; font-size: 14px; margin: 0;">${discardReason || 'የተሳሳተ የክፍያ ደረሰኝ ወይም መረጃ።'}</p>
              </div>

              <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
                እባክዎ ትክክለኛውን የክፍያ ማረጋገጫ ወይም መረጃ በመያዝ በዌብሳይታችን በኩል በድጋሚ ይመዝገቡ።
              </p>

              <!-- FOOTER -->
              <div style="border-top: 1px solid #1e293b; padding-top: 16px; margin-top: 24px; text-align: center;">
                <p style="font-size: 11px; color: #64748b; margin: 0;">AxR Academy Support Team | Cyber Obsidian Portal</p>
              </div>

            </div>
          `,
        });
        if (emailResponse.data) emailSent = true;
      } catch (err: unknown) {
        const error = err as Error;
        console.error('Resend Discard Email Error:', error.message);
        emailError = error.message;
      }
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? 'Student application discarded and notified via Email.'
        : 'Student discarded in database.',
      student: studentData,
      emailSent,
      emailError,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}