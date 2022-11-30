import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { SCOPE_ACTIVE_COMMENT } from '../ActiveCommentProvider';
import { useCommentUser } from '../CommentProvider';
import { useCommentsSelectors, useSetComment } from '../CommentsProvider';

export type ResolveButtonCommentRootProps = HTMLPropsAs<'div'>;

export const useResolveCommentButtonRoot = ({
  ...props
}: ResolveButtonCommentRootProps): HTMLPropsAs<'div'> => {
  const activeCommentId = useCommentsSelectors().activeCommentId();
  const setComments = useSetComment(activeCommentId);
  const user = useCommentUser(SCOPE_ACTIVE_COMMENT);

  const title = `Mark as ${user ? 'done' : 'resolved'} and hide discussion`;

  return {
    onClick: () => {
      setComments({
        isResolved: true,
      });
    },
    title,
    ...props,
  };
};

export const ResolveCommentButton = createComponentAs<ResolveButtonCommentRootProps>(
  (props) => {
    const htmlProps = useResolveCommentButtonRoot(props);
    return createElementAs('div', htmlProps);
  }
);
