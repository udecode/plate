import React from 'react';

import { createPrimitiveComponent } from '@udecode/plate/react';

import {
  useCommentSet,
  useEditingCommentText,
} from '../stores/comment/CommentProvider';

export const useCommentEditTextarea = () => {
  const setEditingValue = useCommentSet('editingValue');
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
});
