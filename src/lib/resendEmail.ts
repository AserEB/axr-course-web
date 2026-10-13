export interface SendEmailParams {
  userId?: number | string;
  toEmail: string;
  studentName: string;
  customId: string;
  status: 'Verified' | 'Discard';
  entranceLink?: string;
  adminMessage?: string;
  adminName?: string;
}

export interface SendOtpParams {
  identifier: string;
}

/**
 * Sends Verification or Discard status emails by calling backend API endpoints.
 */
export async function sendStudentStatusEmail(params: SendEmailParams) {
  try {
    const endpoint = params.status === 'Verified' ? '/api/admin/verify' : '/api/admin/discard';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      console.warn('Email dispatch server notice:', response.statusText);
      return { success: false, error: response.statusText };
    }

    return await response.json();
  } catch (error) {
    console.warn('Client email send notice:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Helper function to trigger a 5-minute OTP Password Reset Email.
 */
export async function requestPasswordResetOtp(identifier: string) {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'send-otp',
        identifier: identifier.trim().toLowerCase(),
      }),
    });

    return await response.json();
  } catch (error) {
    console.warn('OTP request client notice:', error);
    return { success: false, error: (error as Error).message };
  }
}