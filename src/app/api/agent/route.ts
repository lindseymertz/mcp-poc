import Anthropic from '@anthropic-ai/sdk';
import { DEMO_STEPS } from '@/lib/demo/scenarios';
import { GOOGLE_TOOLS } from '@/lib/agent/tools';
import { executeTool } from '@/lib/agent/tool-executor';
import { loadTokens } from '@/lib/auth/token-store';
import { NextRequest } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { stepId } = await req.json();

  const step = DEMO_STEPS.find((s) => s.id === stepId);
  if (!step || step.type !== 'agent_action' || !step.agentContext) {
    return new Response(JSON.stringify({ error: 'Invalid step' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check if Google is authenticated
  const tokens = await loadTokens();
  const hasGoogleAuth = !!tokens;

  const { systemPrompt, task } = step.agentContext;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (type: string, data: Record<string, unknown>) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`)
        );
      };

      try {
        send('status', { message: 'Starting agent...' });

        // Determine which tools to provide based on auth status
        const tools = hasGoogleAuth ? GOOGLE_TOOLS : [];

        // Add context about available tools to the system prompt
        const enhancedSystemPrompt = hasGoogleAuth
          ? `${systemPrompt}\n\nYou have access to Google tools (Gmail, Drive, Calendar). Use them to complete the task. When sending emails, use the actual recipient email from the context.`
          : `${systemPrompt}\n\nNote: Google integration is not connected. Generate the email content but indicate it would be sent when connected.`;

        let messages: Anthropic.MessageParam[] = [{ role: 'user', content: task }];

        let continueLoop = true;
        let finalOutput = '';

        while (continueLoop) {
          send('thinking_delta', { content: hasGoogleAuth ? '> Tools available: Gmail, Drive, Calendar\n' : '> No Google connection - generating content only\n' });

          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 16000,
            thinking: {
              type: 'enabled',
              budget_tokens: 10000,
            },
            tools: tools.length > 0 ? tools : undefined,
            system: enhancedSystemPrompt,
            messages,
          });

          // Process response content
          const toolUseBlocks: Array<{
            id: string;
            name: string;
            input: Record<string, unknown>;
          }> = [];

          for (const block of response.content) {
            if (block.type === 'thinking') {
              // Stream thinking in chunks for better UX
              const chunks = block.thinking.match(/.{1,100}/g) || [];
              for (const chunk of chunks) {
                send('thinking_delta', { content: chunk });
                await new Promise((r) => setTimeout(r, 10));
              }
            } else if (block.type === 'text') {
              finalOutput = block.text;
              send('output_delta', { content: block.text });
            } else if (block.type === 'tool_use') {
              toolUseBlocks.push({
                id: block.id,
                name: block.name,
                input: block.input as Record<string, unknown>,
              });
            }
          }

          // If there are tool calls, execute them
          if (toolUseBlocks.length > 0 && response.stop_reason === 'tool_use') {
            const toolResultContent: Anthropic.ToolResultBlockParam[] = [];

            for (const toolUse of toolUseBlocks) {
              send('thinking_delta', {
                content: `\n\n> Executing tool: ${toolUse.name}...\n`,
              });

              // Log tool input for debugging
              send('thinking_delta', {
                content: `  Input: ${JSON.stringify(toolUse.input, null, 2).substring(0, 200)}...\n`,
              });

              const result = await executeTool(toolUse.name, toolUse.input);

              if (result.success) {
                send('thinking_delta', {
                  content: `  ✓ ${toolUse.name} completed successfully\n`,
                });
                if (result.result) {
                  send('thinking_delta', {
                    content: `  Result: ${JSON.stringify(result.result)}\n`,
                  });
                }
              } else {
                send('thinking_delta', {
                  content: `  ✗ ${toolUse.name} failed: ${result.error}\n`,
                });
              }

              toolResultContent.push({
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: JSON.stringify(result),
              });
            }

            // Add assistant message and tool results to continue the conversation
            messages = [
              ...messages,
              { role: 'assistant', content: response.content },
              { role: 'user', content: toolResultContent },
            ];
          } else {
            // No more tool calls, we're done
            continueLoop = false;
          }
        }

        send('complete', { output: finalOutput });
      } catch (error) {
        console.error('Agent error:', error);
        send('error', {
          message: error instanceof Error ? error.message : 'Unknown error',
        });
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
