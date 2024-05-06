import React from 'react';

import { createPrimitiveComponent } from '@udecode/plate-common';

import {
  useCommentActions,
  useCommentSelectors,
  useCommentText,
} from '../stores/comment/CommentProvider';
import {
  useCommentsSelectors,
  useUpdateComment,
} from '../stores/comments/CommentsProvider';

export const useCommentEditSaveButtonState = () => {
  const onCommentUpdate = useCommentsSelectors().onCommentUpdate();
  const editingValue = useCommentSelectors().editingValue();
  const setEditingValue = useCommentActions().editingValue();
  const id = useCommentSelectors().id();
  const updateComment = useUpdateComment(id);
  const value = useCommentText();

  return {
    editingValue,
    id,
    onCommentUpdate,
    setEditingValue,
    updateComment,
    value,
  };
};

export const useCommentEditSaveButton = ({
  editingValue,
  id,
  onCommentUpdate,
  setEditingValue,
  updateComment,
  value,
}: ReturnType<typeof useCommentEditSaveButtonState>) => {
  return {
    props: {
      disabled: value?.trim().length === 0,
      onClick: React.useCallback(() => {
        if (!editingValue) return;

        updateComment({
          value: editingValue,
        });

        setEditingValue(null);

        onCommentUpdate?.({ id, value: editingValue });
      }, [editingValue, id, onCommentUpdate, setEditingValue, updateComment]),
    },
  };
};

export const CommentEditSaveButton = createPrimitiveComponent('button')({
  propsHook: useCommentEditSaveButton,
  stateHook: useCommentEditSaveButtonState,
});
