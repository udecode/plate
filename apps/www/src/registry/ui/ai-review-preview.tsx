'use client';

import { useEffect, useMemo, useState } from 'react';

import { useAIEditorReview, useEditorCompletion } from '@platejs/ai/react';
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
import { useCompletion } from '@ai-sdk/react';
import { aiReviewPlugin } from '../components/editor/plugins/ai-kit';

export function AIReviewPreview() {
  const editor = useEditorRef();

  const status = usePluginOption(aiReviewPlugin, 'status');
  console.log('🚀 ~ AIReviewPreview ~ status:', status);

  return (
    <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-md border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground shadow-md transition-all duration-300">
      {status}
    </div>
  );
}
