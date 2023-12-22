import { createPrimitiveComponent, nanoid } from '@udecode/plate-common';

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
  const onCommentAdd = useCommentsSelectors().onCommentAdd()?.fn;
  const activeCommentId = useCommentsSelectors().activeCommentId()!;
  const comment = useComment(SCOPE_ACTIVE_COMMENT)!;
  const newValue = useCommentsSelectors().newValue();

  const editingCommentText = useNewCommentText();
  const resetNewCommentValue = useResetNewCommentValue();
  const addComment = useAddComment();

  const isReplyComment = !!comment;

  const submitButtonText = isReplyComment ? 'Reply' : 'Comment';

  return {
    editingCommentText,
    resetNewCommentValue,
    addComment,
    isReplyComment,
    submitButtonText,
    onCommentAdd,
    activeCommentId,
    comment,
    newValue,
  };
};

export const useCommentNewSubmitButton = ({
  editingCommentText,
  resetNewCommentValue,
  addComment,
  isReplyComment,
  submitButtonText,
  onCommentAdd,
  activeCommentId,
  comment,
  newValue,
}: ReturnType<typeof useCommentNewSubmitButtonState>) => {
  return {
    props: {
      type: 'submit',
      disabled: !editingCommentText?.trim().length,
      children: submitButtonText,
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
    },
  };
};

export const CommentNewSubmitButton = createPrimitiveComponent('button')({
  stateHook: useCommentNewSubmitButtonState,
  propsHook: useCommentNewSubmitButton,
});
