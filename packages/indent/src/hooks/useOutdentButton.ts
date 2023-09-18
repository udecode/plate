import { focusEditor, useEditorRef } from '@udecode/plate-common';

import { outdent } from '../index';

export const useOutdentButton = () => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        outdent(editor);
        focusEditor(editor);
      },
    },
  };
};
