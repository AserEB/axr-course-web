import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to mask student email (e.g. biruk@gmail.com -> bir***@gmail.com)
function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  if (user.length <= 3) return `${user[0]}***@${domain}`;
  return `${user.slice(0, 3)}***@${domain}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, identifier, password, type, otp, newPassword } = body;

    // ==========================================
    // ACTION 1: SEND RESET OTP CODE VIA EMAIL (5-MIN EXPIRE)
    // ==========================================
    if (action === 'send-otp') {
      if (!identifier) {
        return NextResponse.json({ error: 'Student ID ወይም Email ማስገባት ያስፈልጋል።' }, { status: 400 });
      }

      const cleanInput = identifier.trim().toLowerCase();

      // Find student record in Supabase
      const { data: student, error } = await supabase
        .from('students')
        .select('user_id, email, full_name, student_custom_id')
        .or(`student_custom_id.ilike.${cleanInput},email.ilike.${cleanInput}`)
        .maybeSingle();

      if (error || !student || !student.email) {
        return NextResponse.json(
          { error: 'በዚህ መረጃ የተመዘገበ ተማሪ አልተገኘም። እባክዎ ID ወይም ኢሜይልዎን በትክክል ያረጋግጡ።' },
          { status: 404 }
        );
      }

      // Generate 6-Digit OTP & 5-Minute Expiration Time
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 Minutes from now

      // Store OTP and Expiry in DB
      const { error: updateError } = await supabase
        .from('students')
        .update({
          reset_otp: generatedOtp,
          reset_otp_expires_at: expiresAt,
        })
        .eq('user_id', student.user_id);

      if (updateError) {
        return NextResponse.json({ error: 'OTP ማስቀመጥ አልተቻለም።' }, { status: 500 });
      }

      // Send Professional OTP Email via Resend
      try {
        await resend.emails.send({
          from: 'AxR Academy <info@aserproduction.tech>',
          to: [student.email],
          subject: '🔐 የ Password መቀየሪያ ማረጋገጫ ቁጥር (AxR Academy OTP)',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #f8fafc; background-color: #090d16; border-radius: 16px; border: 1px solid #1e293b;">
              <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px;">
                <h2 style="color: #38bdf8; margin: 0; font-size: 22px; font-weight: 800;">AxR Academy</h2>
                <p style="font-size: 11px; color: #38bdf8; font-family: monospace; letter-spacing: 1px; text-transform: uppercase; margin-top: 4px;">Password Reset Verification Code</p>
              </div>
              
              <p style="color: #cbd5e1; font-size: 14px; margin-top: 10px;">ሰላም <b>${student.full_name}</b>፣</p>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">የረሱትን የይለፍ ቃል (Password) ለመቀየር የጠየቁት ማረጋገጫ ቁጥር ከታች ያለው ነው። ይህ ቁጥር የሚያገለግለው ለ <b>5 ደቂቃ ብቻ</b> ነው፦</p>
              
              <div style="text-align: center; margin: 24px 0; background-color: #0f172a; padding: 20px; border-radius: 12px; border: 1px solid #0284c7;">
                <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; font-family: monospace;">${generatedOtp}</span>
              </div>

              <p style="color: #64748b; font-size: 12px; text-align: center; line-height: 1.4;">ይህንን የይለፍ ቃል መቀየር ጥያቄ እርስዎ ካልጠየቁ እባክዎ ይህንን መልእክት ችላ ይበሉት።</p>
              
              <div style="border-top: 1px solid #1e293b; padding-top: 12px; margin-top: 20px; text-align: center;">
                <p style="font-size: 10px; color: #475569; margin: 0;">AxR Cyber Obsidian Security Team</p>
              </div>
            </div>
          `,
        });
      } catch (resendErr: unknown) {
        const error = resendErr as Error;
        console.error('Resend OTP Error:', error.message);
        return NextResponse.json({ error: 'ኢሜይሉን መላክ አልተቻለም። እባክዎ ቆይተው ይሞክሩ።' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        maskedEmail: maskEmail(student.email),
      });
    }

    // ==========================================
    // ACTION 2: VERIFY OTP & RESET PASSWORD
    // ==========================================
    if (action === 'reset-password') {
      if (!identifier || !otp || !newPassword) {
        return NextResponse.json({ error: 'ሁሉንም መስኮች መሙላት ያስፈልጋል።' }, { status: 400 });
      }

      const cleanInput = identifier.trim().toLowerCase();

      // Find student
      const { data: student, error } = await supabase
        .from('students')
        .select('user_id, reset_otp, reset_otp_expires_at')
        .or(`student_custom_id.ilike.${cleanInput},email.ilike.${cleanInput}`)
        .maybeSingle();

      if (error || !student) {
        return NextResponse.json({ error: 'ተማሪው አልተገኘም።' }, { status: 404 });
      }

      // Check OTP match
      if (!student.reset_otp || student.reset_otp !== otp.trim()) {
        return NextResponse.json({ error: 'የስህተት ማረጋገጫ ቁጥር (Incorrect OTP Code)!' }, { status: 400 });
      }

      // Check Expiry Time (5 minutes)
      if (!student.reset_otp_expires_at || new Date(student.reset_otp_expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'የማረጋገጫ ኮዱ 5 ደቂቃ አልፎበታል (Expired)! እባክዎ በድጋሚ ኮድ ይላኩ።' },
          { status: 400 }
        );
      }

      // Update Password and Clear OTP fields
      const { error: updateError } = await supabase
        .from('students')
        .update({
          password_hash: newPassword.trim(),
          reset_otp: null,
          reset_otp_expires_at: null,
        })
        .eq('user_id', student.user_id);

      if (updateError) {
        return NextResponse.json({ error: 'Password መቀየር አልተቻለም።' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Password በተሳካ ሁኔታ ተቀይሯል።',
      });
    }

    // ==========================================
    // ACTION 3: DEFAULT LOGIN (ADMIN & STUDENT)
    // ==========================================
    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Identifier and password are required' },
        { status: 400 }
      );
    }

    const cleanInput = identifier.trim();

    // 1. ADMIN AUTHENTICATION
    if (type === 'admin') {
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