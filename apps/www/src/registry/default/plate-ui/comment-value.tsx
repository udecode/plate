'use client';

import React from 'react';
import {
  CommentEditActions,
  CommentEditTextarea,
  useCommentEditTextarea,
  useCommentEditTextareaState,
} from '@udecode/plate-comments';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/registry/default/plate-ui/button';
import { inputVariants } from '@/registry/default/plate-ui/input';

export function CommentValue() {
  const commentTextAreaState = useCommentEditTextareaState();
  const { props: textareaProps } = useCommentEditTextarea(commentTextAreaState);

  return (
    <div className="my-2 flex flex-col items-end gap-2">
      <CommentEditTextarea
        className={cn(inputVariants(), 'min-h-[60px]')}
        {...textareaProps}
      />

      <div className="flex space-x-2">
        <CommentEditActions.CancelButton
          className={buttonVariants({ variant: 'outline', size: 'xs' })}
        >
          Cancel
        </CommentEditActions.CancelButton>

        <CommentEditActions.SaveButton
          className={buttonVariants({ variant: 'default', size: 'xs' })}
        >
          Save
        </CommentEditActions.SaveButton>
      </div>
    </div>
  );
}
