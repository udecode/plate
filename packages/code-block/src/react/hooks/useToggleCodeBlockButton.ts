import type React from 'react';

import { useEditorRef } from '@udecode/plate-common/react';

import { toggleCodeBlock } from '../../lib/transforms';

export const useToggleCodeBlockButton = () => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: () => {
        toggleCodeBlock(editor);
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
