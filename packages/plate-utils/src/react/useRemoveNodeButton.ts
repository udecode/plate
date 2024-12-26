import { useEditorRef } from '@udecode/plate-core/react';
import { type TElement, removeNodes } from '@udecode/slate';

export const useRemoveNodeButton = ({ element }: { element: TElement }) => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: () => {
        const path = editor.findPath(element);

        removeNodes(editor, { at: path });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
