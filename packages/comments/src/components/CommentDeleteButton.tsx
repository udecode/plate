import React, { ButtonHTMLAttributes } from 'react';
import { usePlateEditorRef } from '@udecode/plate-common';
import { useCommentSelectors } from '../stores/comment/CommentProvider';
import {
  useCommentsActions,
  useCommentsSelectors,
  useRemoveComment,
} from '../stores/comments/CommentsProvider';
import { unsetCommentNodesById } from '../utils/index';

export const useCommentDeleteButton = (
  props: ButtonHTMLAttributes<HTMLButtonElement>
): ButtonHTMLAttributes<HTMLButtonElement> => {
  const activeCommentId = useCommentsSelectors().activeCommentId();
  const onCommentDelete = useCommentsSelectors().onCommentDelete();
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

      onCommentDelete?.(id);
    },
    ...props,
  };
};

export function CommentDeleteButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  const htmlProps = useCommentDeleteButton(props);

  return <button type="button" {...htmlProps} />;
}
