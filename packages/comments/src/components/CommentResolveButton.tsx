import { createPrimitiveComponent } from '@udecode/plate-common';

import { useComment } from '../stores/comment/CommentProvider';
import {
  useCommentsActions,
  useCommentsSelectors,
  useUpdateComment,
} from '../stores/comments/CommentsProvider';

export const useCommentResolveButton = () => {
  const onCommentUpdate = useCommentsSelectors().onCommentUpdate()?.fn;
  const activeCommentId = useCommentsSelectors().activeCommentId();
  const setActiveCommentId = useCommentsActions().activeCommentId();
  const updateComment = useUpdateComment(activeCommentId);

  const comment = useComment()!;

  return {
    props: {
      onClick: () => {
        const isResolved = !comment.isResolved;

        const value = {
          isResolved,
        };

        updateComment(value);

        onCommentUpdate?.({
          id: activeCommentId!,
          ...value,
        });

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
