'use client';

import React from 'react';
import { cn } from '@udecode/cn';
import {
  CommentNewSubmitButton,
  CommentNewTextarea,
  useCommentsSelectors,
} from '@udecode/plate-comments';

import { buttonVariants } from '@/components/plate-ui/button';
import { inputVariants } from '@/components/plate-ui/input';

import { CommentAvatar } from './comment-avatar';

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
