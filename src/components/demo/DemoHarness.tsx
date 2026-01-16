'use client';

import { StepControls } from './StepControls';
import { ContentPane } from './ContentPane';
import { ThinkingPane } from './ThinkingPane';
import { useDemoState } from '@/hooks/useDemoState';

export function DemoHarness() {
  const {
    currentStepIndex,
    stepStatuses,
    isRunning,
    thinkingContent,
    contentHistory,
    runStep,
    reset,
    steps,
  } = useDemoState();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Left Pane - Step Controls */}
      <StepControls
        steps={steps}
        currentStepIndex={currentStepIndex}
        stepStatuses={stepStatuses}
        isRunning={isRunning}
        onRunStep={runStep}
        onReset={reset}
      />

      {/* Center Pane - Content Display */}
      <ContentPane
        contentHistory={contentHistory}
        currentStepIndex={currentStepIndex}
      />

      {/* Right Pane - Agent Thinking */}
      <ThinkingPane content={thinkingContent} isThinking={isRunning} />
    </div>
  );
}
