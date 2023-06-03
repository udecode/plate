import { focusEditor, outdent } from '@udecode/plate';
import { usePlateEditorRef } from '@udecode/plate-common';

export const useOutdentButton = () => {
  const editor = usePlateEditorRef();

  return {
    props: {
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        outdent(editor);
        focusEditor(editor);
      },
    },
  };
};
