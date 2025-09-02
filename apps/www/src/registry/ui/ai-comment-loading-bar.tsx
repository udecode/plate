'use client';

import { useEffect, useState } from 'react';

import { CircleStopIcon, Loader2Icon } from 'lucide-react';
import { useEditorRef, usePluginOption } from 'platejs/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { aiCommentPlugin } from '../components/editor/plugins/ai-kit';
import { commentPlugin } from '../components/editor/plugins/comment-kit';
import { AIChatPlugin } from '@platejs/ai/react';

export function AICommentLoadingBar() {
  const [isVisible, setIsVisible] = useState(false);

  const editor = useEditorRef();

  const { status, stop } = usePluginOption(AIChatPlugin, 'chat');

  const isLoading = status === 'streaming';

  const handleReject = () => {
    const rejectCommentIds = editor.getOption(
      aiCommentPlugin,
      'rejectCommentIds'
    );

    rejectCommentIds.forEach((commentId) => {
      editor.getTransforms(commentPlugin).comment.unsetMark({ id: commentId });
    });

    setIsVisible(false);
  };

  const handleAccept = () => {
    setIsVisible(false);
  };

  const handleCancel = () => {
    stop?.();
    setIsVisible(false);
  };

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
    }
  }, [isLoading]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-0 rounded-xl border border-border/50 bg-popover p-1 text-sm text-muted-foreground shadow-xl backdrop-blur-sm',
        !isLoading && 'p-3'
      )}
    >
      {/* Header with controls */}
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-5">
          {!isLoading && (
            <Button size="sm" disabled={isLoading} onClick={handleAccept}>
              Accept
            </Button>
          )}

          {!isLoading && (
            <Button size="sm" disabled={isLoading} onClick={handleReject}>
              Reject
            </Button>
          )}

          {isLoading && (
            <>
              <div className="flex grow items-center gap-2 p-2 text-sm text-muted-foreground select-none">
                <Loader2Icon className="size-4 animate-spin" />
                AI Review in Progress
              </div>

              <Button size="icon" variant="ghost" onClick={handleCancel}>
                <CircleStopIcon />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
