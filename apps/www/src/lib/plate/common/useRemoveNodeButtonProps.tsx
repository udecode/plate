import {
  findNodePath,
  focusEditor,
  removeNodes,
  TElement,
  useEditorRef,
} from '@udecode/plate-common';

import { ButtonProps } from '@/components/ui/button';

export const useRemoveNodeButtonProps = ({
  element,
  ...props
}: ButtonProps & { element: TElement }) => {
  const editor = useEditorRef();

  return {
    onClick: () => {
      const path = findNodePath(editor, element);

      removeNodes(editor, { at: path });

      focusEditor(editor, editor.selection!);
    },
    ...props,
  };
};
