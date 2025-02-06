import React from 'react';

import {
  createPrimitiveComponent,
  useEditorPlugin,
  usePluginOption,
} from '@udecode/plate/react';

import { CommentsPlugin } from '../CommentsPlugin';

export const useCommentNewTextarea = () => {
  const { setOption } = useEditorPlugin(CommentsPlugin);

  const activeComment = usePluginOption(CommentsPlugin, 'activeComment');
  const value = usePluginOption(CommentsPlugin, 'newText');
  const focusTextarea = usePluginOption(CommentsPlugin, 'focusTextarea');

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
