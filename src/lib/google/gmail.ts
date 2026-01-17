import { google } from 'googleapis';
import { getOAuth2Client } from '@/lib/auth/google';
import { loadTokens } from '@/lib/auth/token-store';

async function getGmailClient() {
  const tokens = await loadTokens();
  if (!tokens) throw new Error('Not authenticated with Google');

  const auth = getOAuth2Client();
  auth.setCredentials(tokens);

  return google.gmail({ version: 'v1', auth });
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  body: string;
  from?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const gmail = await getGmailClient();

    // Create email in RFC 2822 format
    const emailLines = [
      `To: ${params.to}`,
      `Subject: ${params.subject}`,
      `Content-Type: text/plain; charset=utf-8`,
      '',
      params.body,
    ];

    const email = emailLines.join('\r\n');
    const encodedEmail = Buffer.from(email).toString('base64url');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    return { success: true, messageId: response.data.id || undefined };
  } catch (error) {
    console.error('Gmail send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}
