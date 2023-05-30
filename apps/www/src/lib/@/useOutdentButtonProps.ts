import { focusEditor, outdent } from '@udecode/plate';
import { usePlateEditorRef } from '@udecode/plate-common';

export const useOutdentButtonProps = () => {
  const editor = usePlateEditorRef();

  return {
    onClick: (e) => {
      e.preventDefault();
      e.stopPropagation();
      outdent(editor);
      focusEditor(editor);
    },
  };
};
