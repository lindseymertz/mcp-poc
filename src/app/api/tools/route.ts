import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/google/gmail';
import { searchFiles } from '@/lib/google/drive';
import { createEvent, getAvailability } from '@/lib/google/calendar';

export async function POST(req: NextRequest) {
  const { tool, params } = await req.json();

  try {
    switch (tool) {
      case 'gmail_send': {
        const emailResult = await sendEmail(params);
        return NextResponse.json(emailResult);
      }

      case 'drive_search': {
        const files = await searchFiles(params.query);
        return NextResponse.json({ success: true, files });
      }

      case 'calendar_create': {
        const eventResult = await createEvent(params);
        return NextResponse.json(eventResult);
      }

      case 'calendar_availability': {
        const slots = await getAvailability(params.date);
        return NextResponse.json({ success: true, slots });
      }

      default:
        return NextResponse.json({ error: 'Unknown tool' }, { status: 400 });
    }
  } catch (error) {
    console.error('Tool execution error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Tool execution failed',
      },
      { status: 500 }
    );
  }
}
