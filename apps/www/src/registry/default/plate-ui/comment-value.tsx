'use client';

import React from 'react';
import {
  CommentEditActions,
  CommentEditTextarea,
  useCommentValue,
} from '@udecode/plate-comments';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/registry/default/plate-ui/button';
import { inputVariants } from '@/registry/default/plate-ui/input';

export function CommentValue() {
  const { textareaRef } = useCommentValue();

  return (
    <div className="my-2 flex flex-col items-end gap-2">
      <CommentEditTextarea
        ref={textareaRef}
        className={cn(inputVariants(), 'min-h-[60px]')}
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
