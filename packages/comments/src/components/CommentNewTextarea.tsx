import React from 'react';

import { createPrimitiveComponent } from '@udecode/plate-common';

import {
  useCommentsActions,
  useCommentsNewReply,
  useCommentsSelectors,
} from '../stores/comments/CommentsProvider';

export const useCommentNewTextareaState = () => {
  const setNewValue = useCommentsActions().newValue();
  const [replyContent] = useCommentsNewReply();
  const focusTextarea = useCommentsSelectors().focusTextarea();
  const setFocusTextarea = useCommentsActions().focusTextarea();

  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    if (focusTextarea) {
      textareaRef.current?.focus();
      setFocusTextarea(false);
    }
  }, [focusTextarea, setFocusTextarea, textareaRef]);

  const placeholder = `Add a comment...`;

  return {
    placeholder,
    replyContent,
    setNewValue,
    textareaRef,
  };
};

export const useCommentNewTextarea = ({
  placeholder,
  replyContent,
  setNewValue,
  textareaRef,
}: ReturnType<typeof useCommentNewTextareaState>) => {
  return {
    props: {
      onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewValue([{ children: [{ text: event.target.value }], type: 'p' }]);
      },
      placeholder,
      ref: textareaRef,
      rows: 1,
      value: replyContent ?? undefined,
    },
  };
};

export const CommentNewTextarea = createPrimitiveComponent('textarea')({
  propsHook: useCommentNewTextarea,
  stateHook: useCommentNewTextareaState,
});
