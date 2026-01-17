'use client';

import { StepControls } from './StepControls';
import { ContentPane } from './ContentPane';
import { ThinkingPane } from './ThinkingPane';
import { AuthStatus } from './AuthStatus';
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
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Header with Auth Status */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">Sales Agent Demo</h1>
          <span className="text-sm text-muted-foreground">InventoryAI</span>
        </div>
        <AuthStatus />
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
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
    </div>
  );
}
