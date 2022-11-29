import React, { forwardRef } from 'react';
import { CommentTextArea, CommentTextAreaProps } from './CommentTextArea';
import { textAreaCss } from './styles';

export const PlateCommentTextArea = forwardRef<
  HTMLTextAreaElement,
  CommentTextAreaProps
>((props: CommentTextAreaProps, ref) => {
  return (
    <div className="mdc-menu-surface--anchor">
      <CommentTextArea {...props} ref={ref} css={textAreaCss} />
    </div>
  );
});
