import { focusEditor, usePlateEditorRef } from '@udecode/plate-common';
import { outdent } from '..';

export const useOutdentButton = () => {
  const editor = usePlateEditorRef();

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
