import React from 'react';
import { Button, ButtonProps } from '@udecode/plate-button';
import { useComment } from '../stores/comment/CommentProvider';
import {
  useCommentsActions,
  useCommentsSelectors,
  useUpdateComment,
} from '../stores/comments/CommentsProvider';

export const useCommentResolveButton = ({
  ...props
}: ButtonProps): ButtonProps => {
  const onCommentUpdate = useCommentsSelectors().onCommentUpdate();
  const activeCommentId = useCommentsSelectors().activeCommentId();
  const setActiveCommentId = useCommentsActions().activeCommentId();
  const updateComment = useUpdateComment(activeCommentId);

  const comment = useComment()!;

  return {
    onClick: () => {
      const isResolved = !comment.isResolved;

      const value = {
        isResolved,
      };

      updateComment(value);

      onCommentUpdate?.({
        id: activeCommentId,
        ...value,
      });

      if (isResolved) {
        setActiveCommentId(null);
      }
    },
    ...props,
  };
};

export const CommentResolveButton = (props: ButtonProps) => {
  const htmlProps = useCommentResolveButton(props);

  return <Button {...htmlProps} />;
};
