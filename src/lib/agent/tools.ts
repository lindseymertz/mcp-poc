import { Tool } from '@anthropic-ai/sdk/resources/messages';

export const GOOGLE_TOOLS: Tool[] = [
  {
    name: 'send_email',
    description: 'Send an email via Gmail',
    input_schema: {
      type: 'object' as const,
      properties: {
        to: { type: 'string', description: 'Recipient email address' },
        subject: { type: 'string', description: 'Email subject line' },
        body: { type: 'string', description: 'Email body content' },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  {
    name: 'search_drive',
    description: 'Search Google Drive for files matching a query',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query (filename or content keywords)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'create_calendar_event',
    description: 'Create a Google Calendar event with optional attendees',
    input_schema: {
      type: 'object' as const,
      properties: {
        summary: { type: 'string', description: 'Event title' },
        description: { type: 'string', description: 'Event description/agenda' },
        start_time: {
          type: 'string',
          description: 'Start time in ISO format (e.g., 2026-01-20T10:00:00-08:00)',
        },
        end_time: { type: 'string', description: 'End time in ISO format' },
        attendees: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of attendee email addresses',
        },
      },
      required: ['summary', 'start_time', 'end_time'],
    },
  },
];

export type ToolName = 'send_email' | 'search_drive' | 'create_calendar_event';
