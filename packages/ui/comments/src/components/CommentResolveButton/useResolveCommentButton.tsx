import { HTMLPropsAs } from '@udecode/plate-core';
import { useComment } from '../CommentProvider';
import {
  useCommentsActions,
  useCommentsSelectors,
  useUpdateComment,
} from '../CommentsProvider';

export type ResolveButtonCommentProps = HTMLPropsAs<'button'>;

export const useResolveCommentButton = ({
  ...props
}: ResolveButtonCommentProps): HTMLPropsAs<'button'> => {
  const activeCommentId = useCommentsSelectors().activeCommentId();
  const setActiveCommentId = useCommentsActions().activeCommentId();
  const updateComment = useUpdateComment(activeCommentId);

  const comment = useComment()!;

  return {
    onClick: () => {
      const isResolved = !comment.isResolved;

      updateComment({
        isResolved,
      });

      if (isResolved) {
        setActiveCommentId(null);
      }
    },
    ...props,
  };
};
