import type { Path } from '@platejs/plite';
import type { PlateEditor } from 'platejs/react';

import { useEditorRef, useNodePath, useReadOnly } from 'platejs/react';

import type { TodoListItemElement } from '../../lib';

export type TodoListElementState = {
  checked: TodoListItemElement['checked'];
  editor: PlateEditor;
  element: TodoListItemElement;
  path: Path | null;
  readOnly: boolean;
};

export const useTodoListElementState = ({
  element,
}: {
  element: TodoListItemElement;
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
  const { checked, path, readOnly } = state;
  const editor = useEditorRef();

  return {
    checkboxProps: {
      checked: !!checked,
      onCheckedChange: (value: boolean) => {
        if (readOnly) return;
        if (!path) return;

        editor.update((tx) => {
          tx.nodes.set<TodoListItemElement>({ checked: value }, { at: path });
        });
      },
    },
  };
};
