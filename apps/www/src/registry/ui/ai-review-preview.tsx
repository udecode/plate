'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  applyAIReview,
  useAIEditorReview,
  useEditorCompletion,
} from '@platejs/ai/react';
import { getCommentKey } from '@platejs/comment';
import { ChevronDown, ChevronUp, Loader2Icon, XIcon } from 'lucide-react';
import { KEYS, nanoid, TextApi } from 'platejs';
import { useEditorRef, usePlateViewEditor } from 'platejs/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';
import { discussionPlugin } from '@/registry/components/editor/plugins/discussion-kit';

import { EditorView } from './editor';
import { useCompletion } from '@ai-sdk/react';

export function AIReviewPreview() {
  const editor = useEditorRef();

  const { completion } = useCompletion({});

  console.log('🚀 ~ AIReviewPreview ~ completion:', completion);
}
