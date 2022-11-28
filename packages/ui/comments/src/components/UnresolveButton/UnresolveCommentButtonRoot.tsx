import { commentsActions } from '@udecode/plate-comments';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type UnresolveCommentButtonRootProps = HTMLPropsAs<'div'> & {
  commentId: string;
  onUnresolveComment?: (id: string) => void;
};

export const useUnresolveCommentButtonRoot = ({
  commentId,
  onUnresolveComment,
  ...props
}: UnresolveCommentButtonRootProps): HTMLPropsAs<'div'> => {
  return {
    onClick: () => {
      onUnresolveComment?.(commentId);
      commentsActions.setComment(commentId, {
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
