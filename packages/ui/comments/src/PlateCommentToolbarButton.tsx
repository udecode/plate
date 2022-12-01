import React, { MouseEventHandler, useCallback } from 'react';
import { useAddCommentMark, useCommentsActions } from '@udecode/plate-comments';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export const useCommentToolbarButton = (
  props: ToolbarButtonProps
): ToolbarButtonProps => {
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

export const PlateCommentToolbarButton = (props: ToolbarButtonProps) => {
  const buttonProps = useCommentToolbarButton(props);

  return <ToolbarButton {...buttonProps} />;
};
