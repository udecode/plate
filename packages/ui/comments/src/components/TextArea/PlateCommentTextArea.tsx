import React, { forwardRef } from 'react';
import { CommentTextAreaProps } from './CommentTextArea';
import { textAreaCss } from './styles';
import { TextArea } from './TextArea';

export const PlateCommentTextArea = forwardRef<
  HTMLTextAreaElement,
  CommentTextAreaProps
>((props: CommentTextAreaProps, ref) => {
  return (
    <div className="mdc-menu-surface--anchor">
      <TextArea.Input {...props} ref={ref} css={textAreaCss} />
    </div>
  );
});
