import { focusEditor, indent } from '@udecode/plate';
import { usePlateEditorRef } from '@udecode/plate-common';

export const useIndentButton = () => {
  const editor = usePlateEditorRef();

  return {
    props: {
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        indent(editor);
        focusEditor(editor);
      },
    },
  };
};
