import { nanoid } from '@udecode/plate-common';
import { createPrimitiveComponent } from '@udecode/plate-common/react';

import {
  SCOPE_ACTIVE_COMMENT,
  useComment,
} from '../stores/comment/CommentProvider';
import {
  useAddComment,
  useCommentsSelectors,
  useNewCommentText,
  useResetNewCommentValue,
} from '../stores/comments/CommentsProvider';

export const useCommentNewSubmitButtonState = () => {
  const onCommentAdd = useCommentsSelectors().onCommentAdd();
  const activeCommentId = useCommentsSelectors().activeCommentId()!;
  const comment = useComment(SCOPE_ACTIVE_COMMENT)!;
  const newValue = useCommentsSelectors().newValue();

  const editingCommentText = useNewCommentText();
  const resetNewCommentValue = useResetNewCommentValue();
  const addComment = useAddComment();

  const isReplyComment = !!comment;

  const submitButtonText = isReplyComment ? 'Reply' : 'Comment';

  return {
    activeCommentId,
    addComment,
    comment,
    editingCommentText,
    isReplyComment,
    newValue,
    onCommentAdd,
    resetNewCommentValue,
    submitButtonText,
  };
};

export const useCommentNewSubmitButton = ({
  activeCommentId,
  addComment,
  comment,
  editingCommentText,
  isReplyComment,
  newValue,
  onCommentAdd,
  resetNewCommentValue,
  submitButtonText,
}: ReturnType<typeof useCommentNewSubmitButtonState>) => {
  return {
    props: {
      children: submitButtonText,
      disabled: !editingCommentText?.trim().length,
      onClick: () => {
        const newComment = addComment(
          isReplyComment
            ? {
                id: nanoid(),
                parentId: comment.id,
                value: newValue,
              }
            : {
                id: activeCommentId,
                value: newValue,
              }
        );

        onCommentAdd?.(newComment);

        resetNewCommentValue();
      },
      type: 'submit',
    },
  };
};

export const CommentNewSubmitButton = createPrimitiveComponent('button')({
  propsHook: useCommentNewSubmitButton,
  stateHook: useCommentNewSubmitButtonState,
});
