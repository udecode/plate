import React from 'react';

import { createPrimitiveComponent } from '@udecode/plate-common/react';

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
    setEditingValue,
    textareaRef,
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
      ref: textareaRef,
      rows: 1,
      value: value ?? undefined,
      onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditingValue([
          { children: [{ text: event.target.value }], type: 'p' },
        ]);
      },
    },
  };
};

export const CommentEditTextarea = createPrimitiveComponent('textarea')({
  propsHook: useCommentEditTextarea,
  stateHook: useCommentEditTextareaState,
});
