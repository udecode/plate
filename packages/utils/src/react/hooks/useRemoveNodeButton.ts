import { useEditor } from '@platejs/core/react';
import type { Element } from '@platejs/plite';

export const useRemoveNodeButton = ({ element }: { element: Element }) => {
  const editor = useEditor();

  return {
    props: {
      onClick: () => {
        const path = editor.read.nodes.path(element);

        if (path) editor.update.nodes.remove({ at: path });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
