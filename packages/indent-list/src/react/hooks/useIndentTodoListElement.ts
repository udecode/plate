import { type TElement, setNodes } from '@udecode/plate-common';
import { findPath, useEditorRef } from '@udecode/plate-common/react';
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
    editor,
    element,
    readOnly,
  };
};

export const useIndentTodoListElement = (
  state: ReturnType<typeof useIndentTodoListElementState>
) => {
  const { checked, editor, element, readOnly } = state;

  return {
    checkboxProps: {
      checked: !!checked,
      onCheckedChange: (value: boolean) => {
        if (readOnly) return;

        const path = findPath(editor, element);

        if (!path) return;

        setNodes(editor, { checked: value }, { at: path });
      },
      onMouseDown: (e: any) => {
        e.preventDefault();
      },
    },
  };
};
