import { useEditorRef } from '@udecode/plate-common';

import { outdent } from '../index';

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
