import React, { forwardRef } from 'react';
import {
  CommentEditTextarea,
  CommentEditTextareaProps,
  CommentNewTextarea,
  CommentNewTextareaProps,
} from '@udecode/plate-comments';
import { cva } from '@udecode/plate-styled-components';

const commentTextareaVariants = cva(
  'm-0 box-border block h-10 min-h-[36px] w-full cursor-text resize-none overflow-hidden break-words rounded border-[1px] border-solid border-[#dadce0] p-2 text-start text-sm leading-5 text-gray-800 outline-0'
);

export const PlateCommentNewTextarea = forwardRef<
  HTMLTextAreaElement,
  CommentNewTextareaProps
>(({ className, ...props }: CommentNewTextareaProps, ref) => {
  return (
    <CommentNewTextarea
      ref={ref}
      className={commentTextareaVariants({ className })}
      {...props}
    />
  );
});

export const PlateCommentEditTextarea = forwardRef<
  HTMLTextAreaElement,
  CommentEditTextareaProps
>(({ className, ...props }: CommentEditTextareaProps, ref) => {
  return (
    <CommentEditTextarea
      {...props}
      ref={ref}
      className={commentTextareaVariants({ className })}
    />
  );
});
