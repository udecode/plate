import { useCallback } from 'react';
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
    value,
    editingValue,
    setEditingValue,
    id,
    onCommentUpdate,
    updateComment,
  };
};

export const useCommentEditSaveButton = ({
  editingValue,
  setEditingValue,
  id,
  onCommentUpdate,
  updateComment,
  value,
}: ReturnType<typeof useCommentEditSaveButtonState>) => {
  return {
    props: {
      onClick: useCallback(() => {
        if (!editingValue) return;

        updateComment({
          value: editingValue,
        });

        setEditingValue(null);

        onCommentUpdate?.({ id, value: editingValue });
      }, [editingValue, id, onCommentUpdate, setEditingValue, updateComment]),
      disabled: value?.trim().length === 0,
    },
  };
};

export const CommentEditSaveButton = createPrimitiveComponent('button')({
  stateHook: useCommentEditSaveButtonState,
  propsHook: useCommentEditSaveButton,
});
