import React, { MouseEventHandler, useCallback } from 'react';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';
import { useAddCommentMark } from './useAddCommentMark';

export type CommentToolbarButtonProps = ToolbarButtonProps;

export const useCommentToolbarButton = (props: CommentToolbarButtonProps) => {
  const addCommentMark = useAddCommentMark();

  const onMouseDown = useCallback<MouseEventHandler<HTMLSpanElement>>(
    (event) => {
      event.preventDefault();

      addCommentMark();
    },
    [addCommentMark]
  );

  return { onMouseDown, ...props };
};

export const CommentToolbarButton = (props: CommentToolbarButtonProps) => {
  const buttonProps = useCommentToolbarButton(props);
  return <ToolbarButton {...buttonProps} />;
};
