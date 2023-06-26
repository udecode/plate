import { focusEditor, usePlateEditorRef } from '@udecode/plate-common';
import { indent } from '../index';

export const useIndentButton = () => {
  const editor = usePlateEditorRef();

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
