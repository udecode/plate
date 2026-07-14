import { useEditorRef } from '@platejs/core/react';
import type { Element } from '@platejs/plite';
import { useEditorReadOnly } from '@platejs/plite-react';

export const useTodoListElementState = ({
  element,
}: {
  element: Element;
}): any => {
  const editor = useEditorRef();
  const { checked } = element;
  const readOnly = useEditorReadOnly();

  return {
    checked,
    editor,
    element,
    readOnly,
  };
};

export const useTodoListElement = (
  state: ReturnType<typeof useTodoListElementState>
) => {
  const { checked, editor, element, readOnly } = state;

  return {
    checkboxProps: {
      checked: !!checked,
      onCheckedChange: (value: boolean) => {
        if (readOnly) return;

        const path = editor.read.nodes.path(element);

        if (!path) return;

        editor.update.nodes.set({ checked: value }, { at: path });
      },
      onMouseDown: (e: any) => {
        e.preventDefault();
      },
    },
  };
};
