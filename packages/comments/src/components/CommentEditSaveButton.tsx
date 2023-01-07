import React, { useCallback } from 'react';
import { Button, ButtonProps } from '@udecode/plate-button';
import {
  useCommentActions,
  useCommentSelectors,
  useCommentText,
} from '../stores/comment/CommentProvider';
import {
  useCommentsSelectors,
  useUpdateComment,
} from '../stores/comments/CommentsProvider';

export const useCommentEditSaveButton = ({ ...props }: ButtonProps) => {
  const onCommentUpdate = useCommentsSelectors().onCommentUpdate();
  const editingValue = useCommentSelectors().editingValue();
  const setEditingValue = useCommentActions().editingValue();
  const id = useCommentSelectors().id();
  const updateComment = useUpdateComment(id);
  const value = useCommentText();

  const onClick = useCallback(() => {
    if (!editingValue) return;

    updateComment({
      value: editingValue,
    });

    setEditingValue(null);

    onCommentUpdate?.({ id, value: editingValue });
  }, [editingValue, id, onCommentUpdate, setEditingValue, updateComment]);

  return {
    onClick,
    disabled: value?.trim().length === 0,
    ...props,
  };
};

export const CommentEditSaveButton = (props: ButtonProps) => {
  const htmlProps = useCommentEditSaveButton(props);

  return <Button {...htmlProps} />;
};
