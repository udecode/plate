'use client';

import { useEffect, useMemo, useState } from 'react';

import { getCommentKey } from '@platejs/comment';
import { ChevronDown, ChevronUp, Loader2Icon, XIcon } from 'lucide-react';
import { KEYS, nanoid, TextApi } from 'platejs';
import {
  useEditorRef,
  usePlateViewEditor,
  usePluginOption,
} from 'platejs/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';
import { discussionPlugin } from '@/registry/components/editor/plugins/discussion-kit';

import { EditorView } from './editor';
import { aiReviewPlugin } from '../components/editor/plugins/ai-kit';

export function AIReviewPreview() {
  const [isVisible, setIsVisible] = useState(false);

  const editor = useEditorRef();

  const { comments, streamObject, error, object, reset, status, stop } =
    usePluginOption(aiReviewPlugin, 'streamObject') ?? {};

  const isLoading = status === 'streaming';

  const handleReject = () => {
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
        'absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-0 rounded-xl border border-border/50 bg-background/95 p-3 text-sm text-muted-foreground shadow-xl backdrop-blur-sm transition-all duration-300 ease-in-out',
        'hover:border-border/70 hover:shadow-2xl'
      )}
    >
      {/* Header with controls */}
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {!isLoading && (
            <Button
              size="sm"
              disabled={isLoading}
              onClick={() => {
                console.log('1111');
              }}
            >
              Accept
            </Button>
          )}

          {!isLoading && (
            <Button size="sm" disabled={isLoading} onClick={handleReject}>
              Reject
            </Button>
          )}

          {isLoading && (
            <div className="flex grow items-center gap-2 p-2 text-sm text-muted-foreground select-none">
              <Loader2Icon className="size-4 animate-spin" />
              AI Review in Progress
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
