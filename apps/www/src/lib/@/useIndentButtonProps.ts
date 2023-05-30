import { focusEditor, indent } from '@udecode/plate';
import { usePlateEditorRef } from '@udecode/plate-common';

export const useIndentButtonProps = () => {
  const editor = usePlateEditorRef();

  return {
    onClick: (e) => {
      e.preventDefault();
      e.stopPropagation();
      indent(editor);
      focusEditor(editor);
    },
  };
};
