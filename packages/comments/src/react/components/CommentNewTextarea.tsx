import React from 'react';

import { createPrimitiveComponent } from '@udecode/plate-common/react';

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
    placeholder,
    setNewValue,
    textareaRef,
    value,
  };
};

export const useCommentNewTextarea = ({
  placeholder,
  setNewValue,
  textareaRef,
  value,
}: ReturnType<typeof useCommentNewTextareaState>) => {
  return {
    props: {
      onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewValue([{ children: [{ text: event.target.value }], type: 'p' }]);
      },
      placeholder,
      ref: textareaRef,
      rows: 1,
      value: value ?? undefined,
    },
  };
};

export const CommentNewTextarea = createPrimitiveComponent('textarea')({
  propsHook: useCommentNewTextarea,
  stateHook: useCommentNewTextareaState,
});
