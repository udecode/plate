import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { useCommentsSelectors, useSetComment } from '../CommentsProvider';

export type UnresolveCommentButtonProps = HTMLPropsAs<'div'> & {};

export const useUnresolveCommentButton = ({
  ...props
}: UnresolveCommentButtonProps): HTMLPropsAs<'div'> => {
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

export const UnresolveCommentButton = createComponentAs<UnresolveCommentButtonProps>(
  (props) => {
    const htmlProps = useUnresolveCommentButton(props);
    return createElementAs('div', htmlProps);
  }
);
