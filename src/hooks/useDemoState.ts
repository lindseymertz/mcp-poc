'use client';

import { useState, useCallback } from 'react';
import { DemoState, StepStatus, ContentItem, Email, Transcript } from '@/types';
import { DEMO_STEPS } from '@/lib/demo/scenarios';

const initialState: DemoState = {
  currentStepIndex: 0,
  stepStatuses: DEMO_STEPS.map(() => 'pending' as StepStatus),
  isRunning: false,
  thinkingContent: '',
  contentHistory: [],
};

export function useDemoState() {
  const [state, setState] = useState<DemoState>(initialState);

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
          await simulateStep(step, stepIndex, appendThinking, addContent);
        } else {
          // Handle agent actions
          await executeAgentStep(step, stepIndex, appendThinking, addContent);
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
  stepIndex: number,
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

// Execute an agent action step (placeholder - will be replaced with real SSE)
async function executeAgentStep(
  step: (typeof DEMO_STEPS)[0],
  stepIndex: number,
  appendThinking: (text: string) => void,
  addContent: (item: ContentItem) => void
) {
  // This is placeholder behavior - will be replaced with real agent execution
  appendThinking('Thinking: Analyzing task requirements...\n');
  await new Promise((resolve) => setTimeout(resolve, 400));

  appendThinking(`Action: Preparing ${step.title.toLowerCase()}...\n`);
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (step.mcpTools && step.mcpTools.length > 0) {
    for (const tool of step.mcpTools) {
      appendThinking(`Tool: Calling ${tool}...\n`);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  appendThinking('\nAnalyzing: Processing context from previous steps...\n');
  await new Promise((resolve) => setTimeout(resolve, 300));

  appendThinking(`Found: Relevant information for ${step.title}\n`);
  await new Promise((resolve) => setTimeout(resolve, 200));

  appendThinking('Decision: Proceeding with action\n');
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Create placeholder email content
  const placeholderEmail: Email = {
    id: `email-step-${stepIndex}`,
    from: 'lindsey@inventoryai.com',
    fromName: 'Lindsey',
    to: 'marcus.chen@acmecorp.com',
    subject: `Re: ${step.title}`,
    body: `[Placeholder email content for Step ${step.number}: ${step.title}]\n\nThis will be replaced with real AI-generated content when the agent integration is complete.`,
    timestamp: new Date().toISOString(),
  };

  addContent({
    type: 'email',
    direction: 'sent',
    data: placeholderEmail,
    stepNumber: step.number,
  });

  appendThinking('\nConclusion: Step completed successfully\n');
}
