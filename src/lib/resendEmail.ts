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
      return { success: false };
    }

    return await response.json();
  } catch (error) {
    console.warn('Client email send notice:', error);
    return { success: false };
  }
}