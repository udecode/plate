import React from 'react';
import { Button, ButtonProps } from '@udecode/plate-button';
import { usePlateEditorRef } from '@udecode/plate-core';
import { useCommentSelectors } from '../stores/comment/CommentProvider';
import {
  useCommentsActions,
  useCommentsSelectors,
  useRemoveComment,
} from '../stores/comments/CommentsProvider';
import { unsetCommentNodesById } from '../utils/index';

export const useCommentDeleteButton = (props: ButtonProps): ButtonProps => {
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

export const CommentDeleteButton = (props: ButtonProps) => {
  const htmlProps = useCommentDeleteButton(props);

  return <Button {...htmlProps} />;
};
