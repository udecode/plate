import React from 'react';

import {
  createPrimitiveComponent,
  useEditorPlugin,
} from '@udecode/plate/react';

import { CommentsPlugin } from '../CommentsPlugin';
import {
  useCommentSet,
  useCommentText,
  useCommentValue,
} from '../stores/comment/CommentProvider';

export const useCommentEditSaveButton = () => {
  const { api, getOptions } = useEditorPlugin(CommentsPlugin);
  const value = useCommentText();

  const id = useCommentValue('id');
  const editingValue = useCommentValue('editingValue');
  const setEditingValue = useCommentSet('editingValue');

  return {
    props: {
      disabled: value?.trim().length === 0,
      onClick: React.useCallback(() => {
        if (!editingValue) return;

        api.comment.updateComment(id, {
          value: editingValue,
        });

        setEditingValue(null);

        getOptions().onCommentUpdate?.({ id, value: editingValue });
      }, [api.comment, editingValue, getOptions, id, setEditingValue]),
    },
  };
};

export const CommentEditSaveButton = createPrimitiveComponent('button')({
  propsHook: useCommentEditSaveButton,
});
