import { focusEditor, useEditorRef } from '@udecode/plate-common';

import { indent } from '../index';

export const useIndentButton = () => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        indent(editor);
        focusEditor(editor);
      },
    },
  };
};
