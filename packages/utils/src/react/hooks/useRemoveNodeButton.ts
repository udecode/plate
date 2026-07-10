import { useEditorRef } from '@platejs/core/react';
import type { Element } from '@platejs/plite';

export const useRemoveNodeButton = ({ element }: { element: Element }) => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: () => {
        editor.update.nodes.remove({ at: element });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
