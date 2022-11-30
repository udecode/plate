import React from 'react';
import { Button, ButtonProps } from '@udecode/plate-button';
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
      if (isReplyComment) {
        addComment({
          parentId: comment.id,
          value: newValue,
        });
      } else {
        addComment({
          id: activeCommentId,
          value: newValue,
        });
      }
      resetNewCommentValue();
    },
    ...props,
  };
};

export const CommentNewSubmitButton = (props: ButtonProps) => {
  const htmlProps = useCommentNewSubmitButton(props);

  return <Button {...htmlProps} />;
};
