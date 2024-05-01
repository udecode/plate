import { useEditorRef } from '@udecode/plate-core';
import { removeNodes, TElement } from '@udecode/slate';
import { findNodePath } from '@udecode/slate-react';

export const useRemoveNodeButton = ({ element }: { element: TElement }) => {
  const editor = useEditorRef();

  return {
    props: {
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
      onClick: () => {
        const path = findNodePath(editor, element);

        removeNodes(editor, { at: path });
      },
    },
  };
};
