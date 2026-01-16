import Anthropic from '@anthropic-ai/sdk';
import { DEMO_STEPS } from '@/lib/demo/scenarios';
import { NextRequest } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  // Debug logging
  console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY);
  console.log('API Key prefix:', process.env.ANTHROPIC_API_KEY?.substring(0, 15));

  const { stepId } = await req.json();

  const step = DEMO_STEPS.find((s) => s.id === stepId);
  if (!step || step.type !== 'agent_action' || !step.agentContext) {
    return new Response(JSON.stringify({ error: 'Invalid step' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Extract agentContext after validation (TypeScript now knows it's defined)
  const { systemPrompt, task } = step.agentContext;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (type: string, data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`));
      };

      try {
        send('status', { message: 'Starting agent...' });

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 16000,
          thinking: {
            type: 'enabled',
            budget_tokens: 10000,
          },
          stream: true,
          system: systemPrompt,
          messages: [{ role: 'user', content: task }],
        });

        let thinkingContent = '';
        let outputContent = '';

        for await (const event of response) {
          if (event.type === 'content_block_start') {
            if (event.content_block.type === 'thinking') {
              send('thinking_start', {});
            } else if (event.content_block.type === 'text') {
              send('output_start', {});
            }
          } else if (event.type === 'content_block_delta') {
            if (event.delta.type === 'thinking_delta') {
              thinkingContent += event.delta.thinking;
              send('thinking_delta', { content: event.delta.thinking });
            } else if (event.delta.type === 'text_delta') {
              outputContent += event.delta.text;
              send('output_delta', { content: event.delta.text });
            }
          } else if (event.type === 'content_block_stop') {
            send('block_stop', {});
          } else if (event.type === 'message_stop') {
            send('complete', {
              thinking: thinkingContent,
              output: outputContent,
            });
          }
        }
      } catch (error) {
        console.error('Agent error:', error);
        send('error', { message: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}