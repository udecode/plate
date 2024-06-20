import { createPrimitiveComponent } from '@udecode/plate-common';

import type { TReply } from '../types';

import {
  useCommentsActions,
  useCommentsSelectors,
} from '../stores/comments/CommentsProvider';
import { getCommentsById } from '../utils/getRepliesByCommentsId';

export const useCommentResolveButton = (replay: TReply) => {
  const activeCommentId = useCommentsSelectors().activeCommentId();
  const commentsList = useCommentsSelectors().commentsList();
  const setActiveCommentId = useCommentsActions().activeCommentId();

  const active = getCommentsById(commentsList, replay.commentsId);

  return {
    props: {
      onClick: () => {
        const isResolved = active?.isResolved;

        // const value = {
        //   isResolved,
        // };

        // updateComment(value);

        // onCommentUpdate?.({
        //   id: activeCommentId!,
        //   ...value,
        // });

        if (isResolved) {
          setActiveCommentId(null);
        }
      },
    },
  };
};

export const CommentResolveButton = createPrimitiveComponent('button')({
  propsHook: useCommentResolveButton,
});
