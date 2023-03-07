import React from 'react';
import { Button, ButtonProps } from '@udecode/plate-button';
import { nanoid } from '@udecode/plate-common';
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

export const useCommentNewSubmitButton = ({
  ...props
}: ButtonProps): ButtonProps => {
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
    ...props,
  };
};

export const CommentNewSubmitButton = (props: ButtonProps) => {
  const htmlProps = useCommentNewSubmitButton(props);

  return <Button {...htmlProps} />;
};
