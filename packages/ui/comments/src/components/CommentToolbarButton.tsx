import React, { MouseEventHandler, useCallback } from 'react';
import { addCommentMark } from '@udecode/plate-comments';
import { usePlateEditorRef } from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export type CommentToolbarButtonProps = {
  onAddThread?: () => void;
} & ToolbarButtonProps;

export const useCommentToolbarButton = (props: CommentToolbarButtonProps) => {
  const { onAddThread, ...otherProps } = props;

  const editor = usePlateEditorRef();

  const onMouseDown = useCallback<MouseEventHandler<HTMLSpanElement>>(
    (event) => {
      event.preventDefault();

      addCommentMark(editor);
    },
    [editor]
  );

  return { ...otherProps, onMouseDown };
};

export const CommentToolbarButton = (props: CommentToolbarButtonProps) => {
  const buttonProps = useCommentToolbarButton(props);
  return <ToolbarButton {...buttonProps} />;
};
