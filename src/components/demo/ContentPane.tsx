'use client';

import { Mail, FileText, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ContentItem, Email, Transcript } from '@/types';
import { cn } from '@/lib/utils';

interface ContentPaneProps {
  contentHistory: ContentItem[];
  currentStepIndex: number;
}

export function ContentPane({ contentHistory, currentStepIndex }: ContentPaneProps) {
  if (contentHistory.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-background p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Mail className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-foreground">No content yet</h3>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Run the first step to start the sales demo.
          <br />
          Content will appear here as the agent works.
        </p>
      </div>
    );
  }

  const currentContent = contentHistory[contentHistory.length - 1];

  return (
    <div className="flex flex-1 flex-col bg-background">
      {/* Header showing what type of content */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-3">
        {currentContent.type === 'email' && <Mail className="h-4 w-4 text-muted-foreground" />}
        {currentContent.type === 'transcript' && (
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        )}
        {currentContent.type === 'proposal' && (
          <FileText className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm font-medium text-foreground">
          {currentContent.type === 'email' && 'Email'}
          {currentContent.type === 'transcript' && 'Call Transcript'}
          {currentContent.type === 'proposal' && 'Proposal'}
        </span>
        {currentContent.direction && (
          <Badge
            variant={currentContent.direction === 'sent' ? 'default' : 'secondary'}
            className={cn(
              'text-[10px]',
              currentContent.direction === 'sent' && 'bg-primary text-primary-foreground',
              currentContent.direction === 'received' && 'bg-success/20 text-success'
            )}
          >
            {currentContent.direction === 'sent' ? 'Sent' : 'Received'}
          </Badge>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          Step {currentContent.stepNumber}
        </span>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {currentContent.type === 'email' && (
            <EmailContent email={currentContent.data as Email} />
          )}
          {currentContent.type === 'transcript' && (
            <TranscriptContent transcript={currentContent.data as Transcript} />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function EmailContent({ email }: { email: Email }) {
  return (
    <div className="space-y-4">
      {/* Email Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-16 text-xs text-muted-foreground">From:</span>
          <span className="text-sm font-medium text-foreground">{email.fromName}</span>
          <span className="text-sm text-muted-foreground">&lt;{email.from}&gt;</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 text-xs text-muted-foreground">To:</span>
          <span className="text-sm text-muted-foreground">{email.to}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 text-xs text-muted-foreground">Subject:</span>
          <span className="text-sm font-medium text-foreground">{email.subject}</span>
        </div>
      </div>

      <Separator />

      {/* Email Body */}
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {email.body}
      </div>
    </div>
  );
}

function TranscriptContent({ transcript }: { transcript: Transcript }) {
  return (
    <div className="space-y-4">
      {/* Transcript Header */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-medium text-foreground">{transcript.title}</h3>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>Date: {transcript.date}</span>
          <span>Duration: {transcript.duration}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {transcript.participants.map((p) => (
            <Badge key={p.name} variant="secondary" className="text-xs">
              {p.name} - {p.role}
            </Badge>
          ))}
        </div>
      </div>

      {/* Key Moments */}
      {transcript.keyMoments && transcript.keyMoments.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="text-sm font-medium text-foreground">Key Moments</h4>
          <div className="mt-2 space-y-2">
            {transcript.keyMoments.map((moment, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <span className="font-mono text-muted-foreground">{moment.timestamp}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    'shrink-0 text-[10px]',
                    moment.type === 'pain_point' && 'border-destructive/50 text-destructive',
                    moment.type === 'requirement' && 'border-warning/50 text-warning',
                    moment.type === 'social_proof' && 'border-success/50 text-success',
                    moment.type === 'next_step' && 'border-primary/50 text-primary'
                  )}
                >
                  {moment.type.replace('_', ' ')}
                </Badge>
                <span className="text-muted-foreground">{moment.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Transcript Text */}
      <div className="space-y-3 font-mono text-sm">
        {transcript.transcript.split('\n').map((line, idx) => {
          if (!line.trim()) return null;
          const match = line.match(/^\[(\d{2}:\d{2}:\d{2})\]\s*(\w+):\s*(.*)$/);
          if (match) {
            const [, timestamp, speaker, text] = match;
            return (
              <div key={idx} className="flex gap-3">
                <span className="shrink-0 text-muted-foreground">{timestamp}</span>
                <span
                  className={cn(
                    'shrink-0 font-semibold',
                    speaker === 'LINDSEY' ? 'text-primary' : 'text-success'
                  )}
                >
                  {speaker}:
                </span>
                <span className="text-foreground">{text}</span>
              </div>
            );
          }
          return (
            <div key={idx} className="text-muted-foreground">
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}
