import type { Element, Path } from '@platejs/slate';
import type React from 'react';
import type { PlateEditor } from 'platejs/react';

import { useEditorRef, useNodePath, useReadOnly } from 'platejs/react';

export type TodoListElementState = {
  checked: unknown;
  editor: PlateEditor;
  element: Element;
  path: Path | null;
  readOnly: boolean;
};

export const useTodoListElementState = ({
  element,
}: {
  element: Element;
}): TodoListElementState => {
  const editor = useEditorRef<PlateEditor>();
  const { checked } = element;
  const path = useNodePath(element);
  const readOnly = useReadOnly();

  return {
    checked,
    editor,
    element,
    path: path ?? null,
    readOnly,
  };
};

export const useTodoListElement = (
  state: ReturnType<typeof useTodoListElementState>
) => {
  const { checked, editor, path, readOnly } = state;

  return {
    checkboxProps: {
      checked: !!checked,
      onCheckedChange: (value: boolean) => {
        if (readOnly) return;

        if (!path) return;

        editor.update((tx) => {
          tx.nodes.set({ checked: value }, { at: path });
        });
      },
      onMouseDown: (e: React.MouseEvent) => {
        e.preventDefault();
      },
    },
  };
};
