import { useEditorRef } from '@platejs/core/react';
import type { Element } from '@platejs/slate';

export const useRemoveNodeButton = ({ element }: { element: Element }) => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: () => {
        const path = editor.api.findPath(element);

        editor.tf.removeNodes({ at: path });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
