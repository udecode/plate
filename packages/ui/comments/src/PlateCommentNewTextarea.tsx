import React, { forwardRef } from 'react';
import {
  CommentEditTextarea,
  CommentEditTextareaProps,
  CommentNewTextarea,
  CommentNewTextareaProps,
} from '@udecode/plate-comments';
import { css } from 'styled-components';
import tw from 'twin.macro';

export const commentTextareaCss = css`
  ${tw`text-gray-800 leading-5 h-10 rounded box-border text-sm p-2 block m-0 overflow-x-hidden overflow-y-hidden resize-none w-full cursor-text`};
  border: 1px solid #dadce0;
  min-height: 36px;
  outline-width: 0;
  text-align: start;
  word-wrap: break-word;
`;

export const PlateCommentNewTextarea = forwardRef<
  HTMLTextAreaElement,
  CommentNewTextareaProps
>((props: CommentNewTextareaProps, ref) => {
  return <CommentNewTextarea {...props} ref={ref} css={commentTextareaCss} />;
});

export const PlateCommentEditTextarea = forwardRef<
  HTMLTextAreaElement,
  CommentEditTextareaProps
>((props: CommentEditTextareaProps, ref) => {
  return <CommentEditTextarea {...props} ref={ref} css={commentTextareaCss} />;
});
