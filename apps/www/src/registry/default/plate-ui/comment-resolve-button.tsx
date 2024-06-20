'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import {
  type TReply,
  useActiveComments,
  useCommentResolveButton,
} from '@udecode/plate-comments';

import { Icons } from '@/components/icons';

import { buttonVariants } from './button';

export function CommentResolveButton({ reply }: { reply: TReply }) {
  const props = useCommentResolveButton(reply);
  const comments = useActiveComments()!;

  return (
    <button
      type="button"
      {...props}
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        'h-6 p-1 text-muted-foreground'
      )}
    >
      {comments.isResolved ? (
        <Icons.refresh className="size-4" />
      ) : (
        <Icons.check className="size-4" />
      )}
    </button>
  );
}
