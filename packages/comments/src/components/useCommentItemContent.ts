import { useMemo } from 'react';

import { getNodeString } from '@udecode/plate-common';

import { type TReply, useCommentsSelectors, useIsEditingReply } from '..';

export const useCommentItemContentState = (reply: TReply) => {
  const users = useCommentsSelectors().users();

  const commentText = useMemo(
    () => reply.value && getNodeString(reply.value[0]),
    [reply.value]
  );
  const user = users[reply.userId];

  const myUserId = useCommentsSelectors().myUserId();
  const isEditing = useIsEditingReply(reply.id);

  const isMyComment = myUserId === reply.userId;

  return {
    commentText,
    isEditing,
    isMyComment,
    myUserId,
    user,
  };
};
