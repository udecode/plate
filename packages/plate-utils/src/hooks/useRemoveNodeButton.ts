import { usePlateEditorRef } from '@udecode/plate-core';
import { TElement, removeNodes } from '@udecode/slate';
import { findNodePath, focusEditor } from '@udecode/slate-react';

export const useRemoveNodeButton = ({ element }: { element: TElement }) => {
  const editor = usePlateEditorRef();

  return {
    props: {
      onClick: () => {
        const path = findNodePath(editor, element);

        removeNodes(editor, { at: path });

        focusEditor(editor, editor.selection!);
      },
    },
  };
};
