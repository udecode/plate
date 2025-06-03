import type { TElement } from '@udecode/slate';

import { useEditorRef } from '@udecode/plate-core/react';

export const useRemoveNodeButton = ({ element }: { element: TElement }) => {
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
