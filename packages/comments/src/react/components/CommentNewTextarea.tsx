import React from 'react';

import {
  createPrimitiveComponent,
  useEditorPlugin,
} from '@udecode/plate/react';

import { CommentsPlugin } from '../CommentsPlugin';

export const useCommentNewTextarea = () => {
  const { setOption, useOption } = useEditorPlugin(CommentsPlugin);

  const activeComment = useOption('activeComment');
  const value = useOption('newText');
  const focusTextarea = useOption('focusTextarea');

  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    if (focusTextarea) {
      textareaRef.current?.focus();
      setOption('focusTextarea', false);
    }
  }, [focusTextarea, setOption, textareaRef]);

  const placeholder = `${activeComment ? 'Reply...' : 'Add a comment...'}`;

  return {
    props: {
      placeholder,
      ref: textareaRef,
      rows: 1,
      value: value ?? undefined,
      onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setOption('newValue', [
          { children: [{ text: event.target.value }], type: 'p' },
        ]);
      },
    },
  };
};

export const CommentNewTextarea = createPrimitiveComponent('textarea')({
  propsHook: useCommentNewTextarea,
});
