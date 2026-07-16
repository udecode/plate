import { useEditorRef } from '@platejs/core/react';
import type { Element } from '@platejs/plite';
import { useEditorReadOnly } from '@platejs/plite-react';
import { KEYS } from '@platejs/utils';

export const useTodoListElementState = ({ element }: { element: Element }) => {
  const editor = useEditorRef();
  const checked = element[KEYS.listChecked] as boolean | undefined;
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
      onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
      },
    },
  };
};
