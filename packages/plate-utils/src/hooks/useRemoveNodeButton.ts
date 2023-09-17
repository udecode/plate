import { useEditorRef } from '@udecode/plate-core';
import { removeNodes, TElement } from '@udecode/slate';
import { findNodePath, focusEditor } from '@udecode/slate-react';

export const useRemoveNodeButton = ({ element }: { element: TElement }) => {
  const editor = useEditorRef();

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
