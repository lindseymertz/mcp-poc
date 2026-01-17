import { google } from 'googleapis';
import { getOAuth2Client } from '@/lib/auth/google';
import { loadTokens } from '@/lib/auth/token-store';

async function getDriveClient() {
  const tokens = await loadTokens();
  if (!tokens) throw new Error('Not authenticated with Google');

  const auth = getOAuth2Client();
  auth.setCredentials(tokens);

  return google.drive({ version: 'v3', auth });
}

export async function searchFiles(query: string): Promise<
  Array<{
    id: string;
    name: string;
    mimeType: string;
    webViewLink?: string;
  }>
> {
  try {
    const drive = await getDriveClient();

    const response = await drive.files.list({
      q: `name contains '${query}' and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink)',
      pageSize: 10,
    });

    return (response.data.files || []).map((file) => ({
      id: file.id || '',
      name: file.name || '',
      mimeType: file.mimeType || '',
      webViewLink: file.webViewLink || undefined,
    }));
  } catch (error) {
    console.error('Drive search error:', error);
    return [];
  }
}

export async function getFileContent(fileId: string): Promise<string | null> {
  try {
    const drive = await getDriveClient();

    const response = await drive.files.get({
      fileId,
      alt: 'media',
    });

    return response.data as string;
  } catch (error) {
    console.error('Drive get file error:', error);
    return null;
  }
}
