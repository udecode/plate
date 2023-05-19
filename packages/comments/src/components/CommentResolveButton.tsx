import React, { ButtonHTMLAttributes } from 'react';
import { useComment } from '../stores/comment/CommentProvider';
import {
  useCommentsActions,
  useCommentsSelectors,
  useUpdateComment,
} from '../stores/comments/CommentsProvider';

export const useCommentResolveButton = ({
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>): ButtonHTMLAttributes<HTMLButtonElement> => {
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
        id: activeCommentId!,
        ...value,
      });

      if (isResolved) {
        setActiveCommentId(null);
      }
    },
    ...props,
  };
};

export function CommentResolveButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  const htmlProps = useCommentResolveButton(props);

  return <button type="button" {...htmlProps} />;
}
