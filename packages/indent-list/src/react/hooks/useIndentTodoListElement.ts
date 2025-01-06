import type { TElement } from '@udecode/plate';

import { useEditorRef, useReadOnly } from '@udecode/plate/react';

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

        const path = editor.api.findPath(element);

        if (!path) return;

        editor.tf.setNodes({ checked: value }, { at: path });
      },
      onMouseDown: (e: any) => {
        e.preventDefault();
      },
    },
  };
};
