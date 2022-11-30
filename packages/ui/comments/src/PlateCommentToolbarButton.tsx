import React, { MouseEventHandler, useCallback } from 'react';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';
import { useCommentsActions } from '../../../comments/src/stores/comments/CommentsProvider';
import { useAddCommentMark } from '../../../comments/src/stores/comments/useAddCommentMark';

export type CommentToolbarButtonProps = ToolbarButtonProps;

export const useCommentToolbarButton = (props: CommentToolbarButtonProps) => {
  const addCommentMark = useAddCommentMark();
  const setFocusTextarea = useCommentsActions().focusTextarea();

  const onMouseDown = useCallback<MouseEventHandler<HTMLSpanElement>>(
    (event) => {
      event.preventDefault();

      addCommentMark();
      setFocusTextarea(true);
    },
    [addCommentMark, setFocusTextarea]
  );

  return { onMouseDown, ...props };
};

export const PlateCommentToolbarButton = (props: CommentToolbarButtonProps) => {
  const buttonProps = useCommentToolbarButton(props);
  return <ToolbarButton {...buttonProps} />;
};
