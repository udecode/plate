import { useEditorRef, useNodePath } from '@platejs/core/react';
import type { Element } from '@platejs/plite';

export const useRemoveNodeButton = ({ element }: { element: Element }) => {
  const editor = useEditorRef();
  const path = useNodePath(element);

  return {
    props: {
      onClick: () => {
        if (!path) return;

        editor.update((tx) => {
          tx.nodes.remove({ at: path });
        });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
