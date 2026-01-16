'use client';

import { useState, useCallback, useRef } from 'react';
import { DemoState, StepStatus, ContentItem, Email, Transcript } from '@/types';
import { DEMO_STEPS } from '@/lib/demo/scenarios';
import { parseEmailFromOutput } from '@/lib/utils/parseAgentOutput';

const initialState: DemoState = {
  currentStepIndex: 0,
  stepStatuses: DEMO_STEPS.map(() => 'pending' as StepStatus),
  isRunning: false,
  thinkingContent: '',
  contentHistory: [],
};

export function useDemoState() {
  const [state, setState] = useState<DemoState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  const setStepStatus = useCallback((index: number, status: StepStatus) => {
    setState((prev) => {
      const newStatuses = [...prev.stepStatuses];
      newStatuses[index] = status;
      return { ...prev, stepStatuses: newStatuses };
    });
  }, []);

  const setCurrentStep = useCallback((index: number) => {
    setState((prev) => ({ ...prev, currentStepIndex: index }));
  }, []);

  const setIsRunning = useCallback((running: boolean) => {
    setState((prev) => ({ ...prev, isRunning: running }));
  }, []);

  const appendThinking = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      thinkingContent: prev.thinkingContent + text,
    }));
  }, []);

  const setThinking = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      thinkingContent: text,
    }));
  }, []);

  const addContent = useCallback((item: ContentItem) => {
    setState((prev) => ({
      ...prev,
      contentHistory: [...prev.contentHistory, item],
    }));
  }, []);

  const runStep = useCallback(
    async (stepIndex: number) => {
      const step = DEMO_STEPS[stepIndex];
      if (!step) return;

      setIsRunning(true);
      setCurrentStep(stepIndex);
      setStepStatus(stepIndex, 'active');

      // Clear thinking for new step and add header
      setThinking(`## Step ${step.number}: ${step.title}\n\n`);

      try {
        if (step.type === 'simulated_response') {
          // Handle simulated responses
          await simulateStep(step, appendThinking, addContent);
        } else {
          // Handle real agent actions via SSE
          await executeAgentStep(
            step,
            appendThinking,
            addContent,
            abortControllerRef
          );
        }

        setStepStatus(stepIndex, 'complete');

        // Auto-advance to next step display
        if (stepIndex < DEMO_STEPS.length - 1) {
          setCurrentStep(stepIndex + 1);
        }
      } catch (error) {
        console.error('Step execution error:', error);
        appendThinking(`\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsRunning(false);
      }
    },
    [setIsRunning, setCurrentStep, setStepStatus, setThinking, appendThinking, addContent]
  );

  const reset = useCallback(() => {
    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(initialState);
  }, []);

  return {
    ...state,
    runStep,
    reset,
    steps: DEMO_STEPS,
  };
}

// Simulate a response step (customer email or transcript loading)
async function simulateStep(
  step: (typeof DEMO_STEPS)[0],
  appendThinking: (text: string) => void,
  addContent: (item: ContentItem) => void
) {
  appendThinking('Simulating customer response...\n');

  // Add typing effect delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (step.simulatedContent?.type === 'email') {
    appendThinking('> Customer email received\n');
    appendThinking(`Found: Email from ${(step.simulatedContent.data as Email).fromName}\n`);
    appendThinking(`Result: Subject - "${(step.simulatedContent.data as Email).subject}"\n`);

    addContent({
      type: 'email',
      direction: 'received',
      data: step.simulatedContent.data as Email,
      stepNumber: step.number,
    });
  } else if (step.simulatedContent?.type === 'transcript') {
    appendThinking('> Loading call transcript from Gong...\n');
    await new Promise((resolve) => setTimeout(resolve, 300));
    appendThinking(`Found: ${(step.simulatedContent.data as Transcript).title}\n`);
    appendThinking(`Result: Duration ${(step.simulatedContent.data as Transcript).duration}\n`);
    appendThinking(`Found: ${(step.simulatedContent.data as Transcript).keyMoments.length} key moments identified\n`);

    addContent({
      type: 'transcript',
      data: step.simulatedContent.data as Transcript,
      stepNumber: step.number,
    });
  }

  appendThinking('\nDecision: Ready for next step\n');
}

// Execute an agent action step using real Claude API with extended thinking
async function executeAgentStep(
  step: (typeof DEMO_STEPS)[0],
  appendThinking: (text: string) => void,
  addContent: (item: ContentItem) => void,
  abortControllerRef: React.MutableRefObject<AbortController | null>
) {
  // Cancel any existing request
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  abortControllerRef.current = new AbortController();

  appendThinking('Connecting to Claude with extended thinking...\n\n');

  try {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepId: step.id }),
      signal: abortControllerRef.current.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';
    let finalOutput = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            switch (data.type) {
              case 'status':
                appendThinking(`> ${data.data.message}\n`);
                break;
              case 'thinking_start':
                appendThinking('--- Agent Thinking ---\n');
                break;
              case 'thinking_delta':
                appendThinking(data.data.content);
                break;
              case 'output_start':
                appendThinking('\n\n--- Agent Output ---\n');
                break;
              case 'output_delta':
                finalOutput += data.data.content;
                break;
              case 'block_stop':
                // Block finished
                break;
              case 'error':
                throw new Error(data.data.message);
              case 'complete':
                appendThinking('\n\nAction: Email drafted successfully\n');
                break;
            }
          } catch (parseError) {
            // Skip malformed JSON
            if (parseError instanceof SyntaxError) {
              console.warn('Malformed SSE data:', line);
            } else {
              throw parseError;
            }
          }
        }
      }
    }

    // Parse the output and add to content
    if (finalOutput) {
      const parsedEmail = parseEmailFromOutput(finalOutput);

      if (parsedEmail) {
        const email: Email = {
          id: `email-${step.id}-${Date.now()}`,
          from: parsedEmail.from,
          fromName: parsedEmail.fromName,
          to: parsedEmail.to,
          subject: parsedEmail.subject,
          body: parsedEmail.body,
          timestamp: new Date().toISOString(),
        };

        addContent({
          type: 'email',
          direction: 'sent',
          data: email,
          stepNumber: step.number,
        });

        appendThinking(`\nResult: Email ready to send to ${parsedEmail.to}\n`);
        appendThinking(`Subject: "${parsedEmail.subject}"\n`);
      } else {
        // Fallback: display raw output
        appendThinking(`\nWarning: Could not parse structured email from output.\n`);
        appendThinking(`Raw output:\n${finalOutput}\n`);
      }
    }

    appendThinking('\nConclusion: Step completed successfully\n');
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      appendThinking('\n\nCancelled.\n');
      return;
    }
    throw error;
  }
}
