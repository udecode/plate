import React from 'react';

import { useCommentsSelectors } from '../stores/index';

export const useFloatingCommentsContentState = () => {
  const activeCommentId = useCommentsSelectors().activeCommentId()!;
  const myUserId = useCommentsSelectors().myUserId();

  const ref = React.useRef(null);

  const hasNoComment = 'TODO:';

  return {
    activeCommentId,
    hasNoComment: hasNoComment,
    myUserId,
    ref,
  };
};
