import React from 'react';

import { useEditorPlugin } from '@udecode/plate-common/react';

import { CommentsPlugin } from '../CommentsPlugin';

export const useFloatingCommentsContentState = () => {
  const { useOption } = useEditorPlugin(CommentsPlugin);

  const activeCommentId = useOption('activeCommentId');
  const activeComment = useOption('activeComment');
  const myUserId = useOption('myUserId');

  const ref = React.useRef(null);

  return {
    activeCommentId,
    hasNoComment: !activeComment,
    myUserId,
    ref,
  };
};
