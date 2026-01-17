import { google } from 'googleapis';
import { getOAuth2Client } from '@/lib/auth/google';
import { loadTokens } from '@/lib/auth/token-store';

async function getCalendarClient() {
  const tokens = await loadTokens();
  if (!tokens) throw new Error('Not authenticated with Google');

  const auth = getOAuth2Client();
  auth.setCredentials(tokens);

  return google.calendar({ version: 'v3', auth });
}

export async function createEvent(params: {
  summary: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  attendees?: string[];
}): Promise<{ success: boolean; eventId?: string; eventLink?: string; error?: string }> {
  try {
    const calendar = await getCalendarClient();

    const event = {
      summary: params.summary,
      description: params.description,
      start: {
        dateTime: params.startTime,
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: params.endTime,
        timeZone: 'America/Los_Angeles',
      },
      attendees: params.attendees?.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    });

    return {
      success: true,
      eventId: response.data.id || undefined,
      eventLink: response.data.htmlLink || undefined,
    };
  } catch (error) {
    console.error('Calendar create error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create event',
    };
  }
}

export async function getAvailability(
  date: string
): Promise<Array<{ start: string; end: string }>> {
  try {
    const calendar = await getCalendarClient();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return (response.data.items || []).map((event) => ({
      start: event.start?.dateTime || event.start?.date || '',
      end: event.end?.dateTime || event.end?.date || '',
    }));
  } catch (error) {
    console.error('Calendar availability error:', error);
    return [];
  }
}
