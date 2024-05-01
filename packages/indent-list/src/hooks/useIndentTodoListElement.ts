import {
  findNodePath,
  setNodes,
  TElement,
  useEditorRef,
} from '@udecode/plate-common';
import { useReadOnly } from 'slate-react';

export const useIndentTodoListElementState = ({
  element,
}: {
  element: TElement;
}) => {
  const editor = useEditorRef();
  const { checked } = element;
  const readOnly = useReadOnly();

  return {
    checked,
    readOnly,
    element,
    editor,
  };
};

export const useIndentTodoListElement = (
  state: ReturnType<typeof useIndentTodoListElementState>
) => {
  const { checked, readOnly, element, editor } = state;

  return {
    checkboxProps: {
      checked: !!checked,
      onMouseDown: (e: any) => {
        e.preventDefault();
      },
      onCheckedChange: (value: boolean) => {
        if (readOnly) return;
        const path = findNodePath(editor, element);
        if (!path) return;
        setNodes(editor, { checked: value }, { at: path });
      },
    },
  };
};
