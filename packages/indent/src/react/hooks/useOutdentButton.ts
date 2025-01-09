import { useEditorRef } from '@udecode/plate/react';

import { outdent } from '../../index';

export const useOutdentButton = () => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: () => {
        outdent(editor);
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
