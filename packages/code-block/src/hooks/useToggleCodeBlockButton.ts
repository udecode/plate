import React from 'react';
import { useEditorRef } from '@udecode/plate-common';
import { toggleCodeBlock } from '../transforms';

export const useToggleCodeBlockButton = () => {
  const editor = useEditorRef();

  return {
    props: {
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
      onClick: () => {
        toggleCodeBlock(editor);
      },
    },
  };
};
