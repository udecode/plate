import { usePlateEditorRef } from '@udecode/plate-core';
import { removeNodes, TElement } from '@udecode/slate';
import { findNodePath, focusEditor } from '@udecode/slate-react';

export const useRemoveNodeButtonProps = ({
  element,
}: {
  element: TElement;
}) => {
  const editor = usePlateEditorRef();

  return {
    onClick: () => {
      const path = findNodePath(editor, element);

      removeNodes(editor, { at: path });

      focusEditor(editor, editor.selection!);
    },
  };
};
