import React from 'react';
import { unsetCommentNodesById } from '@udecode/plate-comments';
import { usePlateEditorRef } from '@udecode/plate-core';
import { PlateButton, PlateButtonProps } from '@udecode/plate-ui-button';
import { useCommentSelectors } from '../CommentProvider';
import {
  useCommentsActions,
  useCommentsSelectors,
  useRemoveComment,
} from '../CommentsProvider';

export const useDeleteCommentButton = (
  props: PlateButtonProps
): PlateButtonProps => {
  const activeCommentId = useCommentsSelectors().activeCommentId();
  const id = useCommentSelectors().id();
  const setActiveCommentId = useCommentsActions().activeCommentId();
  const removeComment = useRemoveComment();
  const editor = usePlateEditorRef();

  return {
    onClick: () => {
      if (activeCommentId === id) {
        unsetCommentNodesById(editor, { id });
        setActiveCommentId(null);
      } else {
        removeComment(id);
      }
    },
    ...props,
  };
};

export const DeleteCommentButton = (props: PlateButtonProps) => {
  const htmlProps = useDeleteCommentButton(props);

  return <PlateButton {...htmlProps} />;
};
