import React from 'react';
import { createPrimitiveComponent } from '@udecode/plate-common';

import {
  useCommentActions,
  useEditingCommentText,
} from '../stores/comment/CommentProvider';

export const useCommentEditTextareaState = () => {
  const setEditingValue = useCommentActions().editingValue();
  const value = useEditingCommentText();

  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
      }
    }, 0);
  }, [textareaRef]);

  return {
    textareaRef,
    setEditingValue,
    value,
  };
};

export const useCommentEditTextarea = ({
  setEditingValue,
  textareaRef,
  value,
}: ReturnType<typeof useCommentEditTextareaState>) => {
  return {
    props: {
      placeholder: 'Add a comment...',
      rows: 1,
      ref: textareaRef,
      value: value ?? undefined,
      onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditingValue([
          { type: 'p', children: [{ text: event.target.value }] },
        ]);
      },
    },
  };
};

export const CommentEditTextarea = createPrimitiveComponent('textarea')({
  stateHook: useCommentEditTextareaState,
  propsHook: useCommentEditTextarea,
});
