'use client';

import { Check, Circle, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DemoStep, StepStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StepControlsProps {
  steps: DemoStep[];
  currentStepIndex: number;
  stepStatuses: StepStatus[];
  isRunning: boolean;
  onRunStep: (index: number) => void;
  onReset: () => void;
}

export function StepControls({
  steps,
  currentStepIndex,
  stepStatuses,
  isRunning,
  onRunStep,
  onReset,
}: StepControlsProps) {
  const completedCount = stepStatuses.filter((s) => s === 'complete').length;

  return (
    <div className="flex h-full w-[280px] flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Demo Steps</h2>
        <span className="text-xs text-muted-foreground">
          {completedCount} of {steps.length}
        </span>
      </div>

      {/* Steps List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {steps.map((step, index) => {
            const status = stepStatuses[index];
            const isActive = index === currentStepIndex;
            const canRun =
              !isRunning &&
              status !== 'complete' &&
              (index === 0 || stepStatuses[index - 1] === 'complete');

            return (
              <button
                key={step.id}
                onClick={() => canRun && onRunStep(index)}
                disabled={!canRun}
                className={cn(
                  'group flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors',
                  isActive && 'bg-primary/10 ring-1 ring-primary/30',
                  !isActive && status !== 'complete' && 'hover:bg-muted/50',
                  status === 'complete' && 'opacity-70',
                  !canRun && 'cursor-default'
                )}
              >
                {/* Step Number/Status */}
                <div
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors',
                    status === 'complete' && 'bg-success text-success-foreground',
                    status === 'active' && 'bg-primary text-primary-foreground',
                    status === 'pending' && 'border border-muted-foreground text-muted-foreground'
                  )}
                >
                  {status === 'complete' ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : status === 'active' ? (
                    <Play className="h-3 w-3" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>

                {/* Step Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isActive ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {step.title}
                    </span>
                    {step.requiresApproval && (
                      <span className="rounded bg-warning/20 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                        HITL
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {step.description}
                  </p>
                  {step.type === 'simulated_response' && (
                    <span className="mt-1 inline-block text-[10px] uppercase tracking-wider text-muted-foreground/70">
                      Simulated
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-muted-foreground hover:text-foreground"
          onClick={onReset}
          disabled={isRunning}
        >
          <RotateCcw className="h-4 w-4" />
          Clear & Reset
        </Button>
      </div>
    </div>
  );
}
