import React from 'react';

import { createPrimitiveComponent } from '@udecode/plate-common';

import type { TReply } from '../types';

import {
  useActiveComments,
  useCommentsActions,
  useCommentsEditingReply,
  useCommentsSelectors,
} from '../stores/comments/CommentsProvider';

export const useCommentEditSaveButtonState = (reply: TReply) => {
  const onCommentUpdate = useCommentsSelectors().onCommentUpdate();

  const activeComments = useActiveComments();
  const myUserId = useCommentsSelectors().myUserId();

  const replyContent = useCommentsEditingReply();
  const setEditingValue = useCommentsActions().editingValue();

  const setEditingReply = useCommentsActions().editingReplyId();

  return {
    activeComments,
    myUserId,
    onCommentUpdate,
    reply,
    replyContent,
    setEditingReply,
    setEditingValue,
  };
};

export const useCommentEditSaveButton = ({
  activeComments,
  myUserId,
  onCommentUpdate,
  reply,
  replyContent,
  setEditingReply,
  setEditingValue,
}: ReturnType<typeof useCommentEditSaveButtonState>) => {
  return {
    props: {
      disabled: false,
      onClick: React.useCallback(() => {
        if (!activeComments || !myUserId) return;

        // updateComment({
        //   value: editingValue,
        // });

        setEditingReply(null);
        setEditingValue(null);

        onCommentUpdate?.(reply, activeComments, replyContent, myUserId);
      }, [
        activeComments,
        myUserId,
        setEditingReply,
        setEditingValue,
        onCommentUpdate,
        reply,
        replyContent,
      ]),
    },
  };
};

export const CommentEditSaveButton = createPrimitiveComponent('button')({
  propsHook: useCommentEditSaveButton,
  stateHook: useCommentEditSaveButtonState,
});
