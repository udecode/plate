import { useEditor } from '@platejs/core/react';
import { useEditorReadOnly } from '@platejs/plite-react';

import type { TTodoListItemElement } from '../../lib';

export const useTodoListElementState = ({
  element,
}: {
  element: TTodoListItemElement;
}): any => {
  const editor = useEditor();
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
  const { checked, element, readOnly } = state;
  const editor = useEditor();

  return {
    checkboxProps: {
      checked: !!checked,
      onCheckedChange: (value: boolean) => {
        if (readOnly) return;

        editor.update.nodes.set({ checked: value }, { at: element });
      },
    },
  };
};
