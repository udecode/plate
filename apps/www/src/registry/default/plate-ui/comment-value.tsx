'use client';

import React from 'react';

import { cn, createPrimitiveComponent } from '@udecode/cn';
import {
  CommentEditActions,
  CommentEditTextarea,
  type TReply,
  useCommentEditSaveButton,
  useCommentEditSaveButtonState,
} from '@udecode/plate-comments';

import { buttonVariants } from './button';
import { inputVariants } from './input';

export const CommentEditSaveButton = createPrimitiveComponent('button')({
  propsHook: useCommentEditSaveButton,
  stateHook: useCommentEditSaveButtonState,
});

export function CommentValue({ reply }: { reply: TReply }) {
  return (
    <div className="my-2 flex flex-col items-end gap-2">
      <CommentEditTextarea className={cn(inputVariants(), 'min-h-[60px]')} />

      <div className="flex space-x-2">
        {/* TODO: */}
        <CommentEditActions.CancelButton
          className={buttonVariants({ size: 'xs', variant: 'outline' })}
        >
          Cancel
        </CommentEditActions.CancelButton>

        <CommentEditSaveButton
          className={buttonVariants({ size: 'xs', variant: 'default' })}
          options={reply}
        >
          Save
        </CommentEditSaveButton>
      </div>
    </div>
  );
}
