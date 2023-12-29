import React from 'react';
import { createPrimitiveComponent } from '@udecode/plate-common';

import {
  useCommentById,
  useCommentsActions,
  useCommentsSelectors,
  useNewCommentText,
} from '../stores/comments/CommentsProvider';

export const useCommentNewTextareaState = () => {
  const setNewValue = useCommentsActions().newValue();
  const activeComment = useCommentById(
    useCommentsSelectors().activeCommentId()
  );
  const value = useNewCommentText();
  const focusTextarea = useCommentsSelectors().focusTextarea();
  const setFocusTextarea = useCommentsActions().focusTextarea();

  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    if (focusTextarea) {
      textareaRef.current?.focus();
      setFocusTextarea(false);
    }
  }, [focusTextarea, setFocusTextarea, textareaRef]);

  const placeholder = `${activeComment ? 'Reply...' : 'Add a comment...'}`;

  return {
    textareaRef,
    placeholder,
    value,
    setNewValue,
  };
};

export const useCommentNewTextarea = ({
  textareaRef,
  placeholder,
  value,
  setNewValue,
}: ReturnType<typeof useCommentNewTextareaState>) => {
  return {
    props: {
      placeholder,
      rows: 1,
      ref: textareaRef,
      value: value ?? undefined,
      onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewValue([{ type: 'p', children: [{ text: event.target.value }] }]);
      },
    },
  };
};

export const CommentNewTextarea = createPrimitiveComponent('textarea')({
  stateHook: useCommentNewTextareaState,
  propsHook: useCommentNewTextarea,
});
