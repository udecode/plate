import { createPrimitiveComponent } from '@udecode/plate-common';

import type { TReply } from '../types';

import {
  useActiveComments,
  useCommentsSelectors,
} from '../stores/comments/CommentsProvider';

export const useCommentDeleteButtonState = (reply: TReply) => {
  const activeComments = useActiveComments();
  const myUserId = useCommentsSelectors().myUserId();
  const onCommentDelete = useCommentsSelectors().onCommentDelete();

  return {
    activeComments,
    myUserId,
    onCommentDelete,
    reply,
  };
};

export const useCommentDeleteButton = ({
  activeComments,
  myUserId,
  onCommentDelete,
  reply,
}: ReturnType<typeof useCommentDeleteButtonState>) => {
  return {
    props: {
      onClick: () => {
        if (!activeComments || !myUserId) return;

        onCommentDelete?.(reply, activeComments, myUserId);

        // TODO: remove mark if remove all the comment
        // unsetCommentNodesById(editor, { id });
      },
    },
  };
};

export const CommentDeleteButton = createPrimitiveComponent('button')({
  propsHook: useCommentDeleteButton,
  stateHook: useCommentDeleteButtonState,
});
