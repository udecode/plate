import { createPrimitiveComponent } from '@udecode/plate-common';

import type { TReply } from '../types';

import { useCommentsActions } from '../stores';

export const useCommentEditButtonState = (reply: TReply) => {
  const setOpenMenuReplyId = useCommentsActions().openMenuReplyId();
  const setNewEditingValue = useCommentsActions().editingValue();
  const setEditingReply = useCommentsActions().editingReplyId();

  return {
    reply,
    setEditingReply,
    setNewEditingValue,
    setOpenMenuReplyId,
  };
};

export const useCommentEditButton = ({
  reply,
  setEditingReply,
  setNewEditingValue,
  setOpenMenuReplyId,
}: ReturnType<typeof useCommentEditButtonState>) => {
  return {
    props: {
      onClick: () => {
        setOpenMenuReplyId(reply.id);
        setEditingReply(reply.id);
        setNewEditingValue(reply.value);
      },
    },
  };
};

export const CommentEditButton = createPrimitiveComponent('button')({
  propsHook: useCommentEditButton,
  stateHook: useCommentEditButtonState,
});
