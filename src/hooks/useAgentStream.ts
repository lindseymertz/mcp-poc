'use client';

import { useState, useCallback, useRef } from 'react';

interface StreamState {
  isStreaming: boolean;
  thinking: string;
  output: string;
  error: string | null;
}

export function useAgentStream() {
  const [state, setState] = useState<StreamState>({
    isStreaming: false,
    thinking: '',
    output: '',
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const executeStep = useCallback(async (stepId: string): Promise<{ thinking: string; output: string } | null> => {
    // Reset state
    setState({
      isStreaming: true,
      thinking: '',
      output: '',
      error: null,
    });

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    let finalThinking = '';
    let finalOutput = '';

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

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
                case 'thinking_delta':
                  finalThinking += data.data.content;
                  setState((prev) => ({
                    ...prev,
                    thinking: prev.thinking + data.data.content,
                  }));
                  break;
                case 'output_delta':
                  finalOutput += data.data.content;
                  setState((prev) => ({
                    ...prev,
                    output: prev.output + data.data.content,
                  }));
                  break;
                case 'error':
                  setState((prev) => ({
                    ...prev,
                    error: data.data.message,
                    isStreaming: false,
                  }));
                  return null;
                case 'complete':
                  setState((prev) => ({
                    ...prev,
                    isStreaming: false,
                  }));
                  return { thinking: finalThinking, output: finalOutput };
              }
            } catch {
              // Skip malformed JSON
              console.warn('Malformed SSE data:', line);
            }
          }
        }
      }

      setState((prev) => ({ ...prev, isStreaming: false }));
      return { thinking: finalThinking, output: finalOutput };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null; // Cancelled, ignore
      }
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isStreaming: false,
      }));
      return null;
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState((prev) => ({ ...prev, isStreaming: false }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isStreaming: false,
      thinking: '',
      output: '',
      error: null,
    });
  }, []);

  return {
    ...state,
    executeStep,
    cancel,
    reset,
  };
}
