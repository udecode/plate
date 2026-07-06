import { useEditorRef } from '@platejs/core/react';
import type { Element } from '@platejs/plite';

export const useRemoveNodeButton = ({ element }: { element: Element }) => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: () => {
        const path = editor.read.nodes.pathOf(element);

        if (!path) return;

        editor.update.nodes.remove({ at: path });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
