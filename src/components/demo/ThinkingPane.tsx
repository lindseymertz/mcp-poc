'use client';

import { useEffect, useRef } from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ThinkingPaneProps {
  content: string;
  isThinking: boolean;
}

export function ThinkingPane({ content, isThinking }: ThinkingPaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when content updates
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [content]);

  return (
    <div className="flex h-full w-[400px] flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Brain className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Agent Reasoning</h2>
        {isThinking && (
          <div className="ml-auto flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Thinking...</span>
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4" ref={contentRef}>
          {content ? (
            <div className="space-y-2">
              <ThinkingContent content={content} isThinking={isThinking} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Brain className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                Agent reasoning will stream here
                <br />
                as steps are executed.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ThinkingContent({ content, isThinking }: { content: string; isThinking: boolean }) {
  // Parse the content for syntax highlighting
  const lines = content.split('\n');

  return (
    <div className="font-mono text-xs leading-relaxed">
      {lines.map((line, idx) => {
        // Detect different types of content for styling
        const isAction = line.startsWith('Action:') || line.startsWith('> ');
        const isFinding = line.startsWith('Found:') || line.startsWith('Result:');
        const isDecision = line.startsWith('Decision:') || line.startsWith('Conclusion:');
        const isThought = line.startsWith('Thinking:') || line.startsWith('Analyzing:');
        const isTool = line.includes('Tool:') || line.includes('MCP:');
        const isHeader = line.startsWith('##') || line.startsWith('**');

        return (
          <div
            key={idx}
            className={cn(
              'py-0.5',
              isAction && 'text-primary',
              isFinding && 'text-success',
              isDecision && 'text-warning',
              isThought && 'text-muted-foreground italic',
              isTool && 'text-purple-400',
              isHeader && 'font-semibold text-foreground',
              !isAction &&
                !isFinding &&
                !isDecision &&
                !isThought &&
                !isTool &&
                !isHeader &&
                'text-foreground/80'
            )}
          >
            {line || '\u00A0'}
          </div>
        );
      })}
      {isThinking && (
        <span className="cursor-blink inline-block text-primary" />
      )}
    </div>
  );
}
