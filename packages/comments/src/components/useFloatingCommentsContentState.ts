import React from 'react';

import { useCommentById, useCommentsSelectors } from '../stores/index';

export const useFloatingCommentsContentState = () => {
  const activeCommentId = useCommentsSelectors().activeCommentId()!;
  const activeComment = useCommentById(activeCommentId);
  const myUserId = useCommentsSelectors().myUserId();

  const ref = React.useRef(null);

  return {
    ref,
    activeCommentId,
    myUserId,
    hasNoComment: !activeComment,
  };
};
