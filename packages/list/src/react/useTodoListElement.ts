import { useEditor } from '@platejs/core/react';
import type { Element } from '@platejs/plite';
import { useEditorReadOnly } from '@platejs/plite-react';

export const useTodoListElementState = ({ element }: { element: Element }) => {
  const checked = element.checked as boolean | undefined;
  const readOnly = useEditorReadOnly();

  return {
    checked,
    element,
    readOnly,
  };
};

export const useTodoListElement = (
  state: ReturnType<typeof useTodoListElementState>
) => {
  const editor = useEditor();
  const { checked, element, readOnly } = state;

  return {
    checkboxProps: {
      checked: !!checked,
      onCheckedChange: (value: boolean) => {
        if (readOnly) return;

        editor.update.nodes.set({ checked: value }, { at: element });
      },
      onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
      },
    },
  };
};
