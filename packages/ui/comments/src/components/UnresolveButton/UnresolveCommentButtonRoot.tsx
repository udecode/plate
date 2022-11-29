import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { useCommentsSelectors, useSetComment } from '../CommentsProvider';

export type UnresolveCommentButtonRootProps = HTMLPropsAs<'div'> & {};

export const useUnresolveCommentButtonRoot = ({
  ...props
}: UnresolveCommentButtonRootProps): HTMLPropsAs<'div'> => {
  const activeCommentId = useCommentsSelectors().activeCommentId();
  const setComments = useSetComment(activeCommentId);

  return {
    onClick: () => {
      // onUnresolveComment?.(commentId);
      setComments({
        isResolved: false,
      });
    },
    ...props,
  };
};

export const UnresolveCommentButtonRoot = createComponentAs<UnresolveCommentButtonRootProps>(
  (props) => {
    const htmlProps = useUnresolveCommentButtonRoot(props);
    return createElementAs('div', htmlProps);
  }
);
