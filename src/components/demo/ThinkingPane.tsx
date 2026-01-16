'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Brain, Loader2, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThinkingPaneProps {
  content: string;
  isThinking: boolean;
}

const SCROLL_THRESHOLD = 50; // pixels from bottom to consider "at bottom"

export function ThinkingPane({ content, isThinking }: ThinkingPaneProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isAutoScrolling = useRef(false);

  // Check if scroll position is near bottom
  const isNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
  }, []);

  // Handle scroll events to detect user intent
  const handleScroll = useCallback(() => {
    // Ignore scroll events triggered by auto-scroll
    if (isAutoScrolling.current) return;

    const nearBottom = isNearBottom();

    if (!nearBottom) {
      // User scrolled up
      setUserScrolledUp(true);
      setShowScrollButton(true);
    } else {
      // User scrolled back to bottom
      setUserScrolledUp(false);
      setShowScrollButton(false);
    }
  }, [isNearBottom]);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    isAutoScrolling.current = true;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });

    // Reset flag after animation completes
    setTimeout(() => {
      isAutoScrolling.current = false;
      setUserScrolledUp(false);
      setShowScrollButton(false);
    }, 300);
  }, []);

  // Auto-scroll when content updates (only if conditions are met)
  useEffect(() => {
    // Only auto-scroll if:
    // 1. We're actively streaming (isThinking)
    // 2. User hasn't manually scrolled up
    if (isThinking && !userScrolledUp) {
      scrollToBottom();
    }
  }, [content, isThinking, userScrolledUp, scrollToBottom]);

  // Reset scroll state when a new thinking session starts
  useEffect(() => {
    if (isThinking && content.length < 100) {
      // New session starting, reset state
      setUserScrolledUp(false);
      setShowScrollButton(false);
    }
  }, [isThinking, content]);

  // Hide scroll button when not streaming and at bottom
  useEffect(() => {
    if (!isThinking && isNearBottom()) {
      setShowScrollButton(false);
    }
  }, [isThinking, isNearBottom]);

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
      <div className="relative flex-1">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="absolute inset-0 overflow-y-auto"
        >
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
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <Button
              size="sm"
              variant="secondary"
              onClick={scrollToBottom}
              className="gap-1.5 rounded-full shadow-lg"
            >
              <ArrowDown className="h-3 w-3" />
              <span className="text-xs">Scroll to bottom</span>
            </Button>
          </div>
        )}
      </div>
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
