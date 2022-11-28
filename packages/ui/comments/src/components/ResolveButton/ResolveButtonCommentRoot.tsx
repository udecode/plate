import { commentsActions, useCommentsSelectors } from '@udecode/plate-comments';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ResolveButtonCommentRootProps = {
  commentId: string;
  onResolveComment?: (id: string) => void;
} & HTMLPropsAs<'div'>;

export const useResolveCommentButtonRoot = ({
  commentId,
  onResolveComment,
  ...props
}: ResolveButtonCommentRootProps): HTMLPropsAs<'div'> => {
  const comment = useCommentsSelectors().comment(commentId);
  const user = useCommentsSelectors().user(comment.userId);

  const title = `Mark as ${user ? 'done' : 'resolved'} and hide discussion`;

  return {
    onClick: () => {
      onResolveComment?.(commentId);
      commentsActions.setComment(commentId, {
        isResolved: true,
      });
    },
    title,
    ...props,
  };
};

export const ResolveButtonCommentRoot = createComponentAs<ResolveButtonCommentRootProps>(
  (props) => {
    const htmlProps = useResolveCommentButtonRoot(props);
    return createElementAs('div', htmlProps);
  }
);
