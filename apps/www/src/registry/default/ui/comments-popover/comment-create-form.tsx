'use client';

import React from 'react';
import {
  CommentNewSubmitButton,
  CommentNewTextarea,
  useCommentsSelectors,
} from '@udecode/plate-comments';
import { CommentAvatar } from './comment-avatar';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/registry/default/ui/button';
import { inputVariants } from '@/registry/default/ui/input';

export function CommentCreateForm() {
  const myUserId = useCommentsSelectors().myUserId();

  return (
    <div className="flex w-full space-x-2">
      <CommentAvatar userId={myUserId} />

      <div className="flex grow flex-col items-end gap-2">
        <CommentNewTextarea className={inputVariants()} />

        <CommentNewSubmitButton
          className={cn(buttonVariants({ size: 'sm' }), 'w-[90px]')}
        >
          Comment
        </CommentNewSubmitButton>
      </div>
    </div>
  );
}
