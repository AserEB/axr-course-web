import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = new Resend(resendApiKey);

interface StudentStatusEmailParams {
    toEmail: string;
    studentName: string;
    customId: string;
    status: 'Verified' | 'Discard';
    adminMessage?: string;
    entranceLink?: string;
}

/**
 * ተማሪ Verified ወይም Discard ሲደረግ በ Resend.com በኩል አውቶማቲክ ኢሜይል መላኪያ
 */
export async function sendStudentStatusEmail({
    toEmail,
    studentName,
    customId,
    status,
    adminMessage,
    entranceLink,
}: StudentStatusEmailParams) {
    if (!resendApiKey) {
        console.warn('⚠️ RESEND_API_KEY አልተዋቀረም። ኢሜይሉ አልተላከም።');
        return { success: false, error: 'API Key missing' };
    }

    const isApproved = status === 'Verified';

    const subject = isApproved
        ? `🎉 Welcome to AxR Course! Registration Approved (${customId})`
        : `⚠️ AxR Course Registration Update (${customId})`;

    const htmlContent = isApproved
        ? `
    <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #0b1329; color: #ffffff; border-radius: 12px;">
      <h2 style="color: #38bdf8; font-size: 22px;">🎉 እንኳን ደስ አለዎት ${studentName}!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">የክፍያ ማረጋገጫዎ በትክክል ተረጋግጦ አክቲቭ ሆኗል።</p>
      
      <div style="margin: 20px 0; padding: 16px; background-color: #1e293b; border-radius: 8px; border-left: 4px solid #10b981;">
        <p style="margin:0 0 8px 0; color: #94a3b8; font-size: 13px;">YOUR UNIQUE STUDENT ID</p>
        <code style="font-size: 18px; color: #34d399; font-weight: bold;">${customId}</code>
      </div>

      <div style="margin: 20px 0; padding: 16px; background-color: #1e293b; border-radius: 8px; border-left: 4px solid #38bdf8;">
        <p style="margin:0 0 8px 0; color: #94a3b8; font-size: 13px;">PRIVATE CLASS ENTRANCE LINK (ONE-TIME LINK)</p>
        <a href="${entranceLink}" style="color: #38bdf8; font-weight: bold; font-size: 16px; text-decoration: underline;">${entranceLink}</a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
        ⚠️ ማሳሰቢያ፦ ይህ የመግቢያ ሊንክ ለርስዎ ብቻ የተዘጋጀ ስለሆነ ለሌላ ሰው አያጋሩ።
      </p>
      <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">Aser Academy × Remedial Hub</p>
    </div>
    `
        : `
    <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #0b1329; color: #ffffff; border-radius: 12px;">
      <h2 style="color: #f43f5e; font-size: 22px;">❌ ውድ ${studentName}፣ ምዝገባዎ ውድቅ ተደርጓል</h2>
      <p style="font-size: 15px; color: #cbd5e1;"><strong>Student ID:</strong> ${customId}</p>
      
      <div style="margin: 20px 0; padding: 16px; background-color: #1e293b; border-radius: 8px; border-left: 4px solid #f43f5e;">
        <p style="margin:0 0 8px 0; color: #94a3b8; font-size: 13px;">REASON FOR DISCARD / የውድቅ መደረጊያ ምክንያት</p>
        <p style="margin:0; color: #fda4af; font-size: 15px;">${adminMessage || 'የላኩት ክፍያ ስክሪንሹት ወይም መረጃ አልተረጋገጠም።'}</p>
      </div>

      <p style="font-size: 14px; color: #cbd5e1;">
        እባክዎ ዌብሳይቱ ላይ Login በማድረግ ወይም ዳሽቦርድዎን በመጎብኘት ትክክለኛውን የክፍያ ማረጋገጫ በድጋሚ ይላኩ።
      </p>
      <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">Aser Academy × Remedial Hub</p>
    </div>
    `;

    try {
        const response = await resend.emails.send({
            from: 'AxR Academy <notifications@aserproduction.tech>',
            to: [toEmail],
            subject,
            html: htmlContent,
        });
        return { success: true, data: response };
    } catch (error) {
        console.error('Failed to send Resend email:', error);
        return { success: false, error };
    }
}