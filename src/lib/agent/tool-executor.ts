import { sendEmail } from '@/lib/google/gmail';
import { searchFiles } from '@/lib/google/drive';
import { createEvent } from '@/lib/google/calendar';

export interface ToolResult {
  success: boolean;
  result?: Record<string, unknown>;
  error?: string;
}

export async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<ToolResult> {
  try {
    switch (name) {
      case 'send_email': {
        const emailResult = await sendEmail({
          to: input.to as string,
          subject: input.subject as string,
          body: input.body as string,
        });
        return {
          success: emailResult.success,
          result: emailResult.messageId
            ? { messageId: emailResult.messageId }
            : undefined,
          error: emailResult.error,
        };
      }

      case 'search_drive': {
        const files = await searchFiles(input.query as string);
        return {
          success: true,
          result: { files, count: files.length },
        };
      }

      case 'create_calendar_event': {
        const eventResult = await createEvent({
          summary: input.summary as string,
          description: input.description as string | undefined,
          startTime: input.start_time as string,
          endTime: input.end_time as string,
          attendees: input.attendees as string[] | undefined,
        });
        return {
          success: eventResult.success,
          result: eventResult.eventLink
            ? { eventLink: eventResult.eventLink, eventId: eventResult.eventId }
            : undefined,
          error: eventResult.error,
        };
      }

      default:
        return { success: false, error: `Unknown tool: ${name}` };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Tool execution failed',
    };
  }
}
