import {
  findNodePath,
  focusEditor,
  removeNodes,
  TElement,
  useEditorRef,
} from '@udecode/plate-common';

export const useRemoveNodeButtonProps = ({
  element,
}: {
  element: TElement;
}) => {
  const editor = useEditorRef();

  return {
    onClick: () => {
      const path = findNodePath(editor, element);

      removeNodes(editor, { at: path });

      focusEditor(editor, editor.selection!);
    },
  };
};
