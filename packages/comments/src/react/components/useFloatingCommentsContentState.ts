import React from 'react';

import { usePluginOption } from '@udecode/plate/react';

import { CommentsPlugin } from '../CommentsPlugin';

export const useFloatingCommentsContentState = () => {
  const activeCommentId = usePluginOption(CommentsPlugin, 'activeCommentId');
  const activeComment = usePluginOption(CommentsPlugin, 'activeComment');
  const myUserId = usePluginOption(CommentsPlugin, 'myUserId');

  const ref = React.useRef(null);

  return {
    activeCommentId,
    hasNoComment: !activeComment,
    myUserId,
    ref,
  };
};
