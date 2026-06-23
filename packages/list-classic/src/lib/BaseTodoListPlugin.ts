import type {
  EditorExtensionInput,
  EditorUpdateTransaction,
  Element,
} from '@platejs/plite';
import { createEditorPlugin } from '@platejs/core';
import { defineEditorExtension } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { getTodoListItemEntry } from './queries';
import { insertTodoListItem } from './transforms';

export interface TodoListItemElement extends Element {
  checked?: boolean;
}

const isElementOfType = (node: unknown, type: string) =>
  typeof node === 'object' &&
  node !== null &&
  'children' in node &&
  (node as { type?: unknown }).type === type;

const createTodoListClassicExtension = (
  editor: {
    selection: unknown;
  } & Parameters<typeof getTodoListItemEntry>[0]
): EditorExtensionInput =>
  defineEditorExtension({
    name: 'plate:todo-list-classic',
    transforms: {
      insertBreak({ next }) {
        if (!editor.selection) return next();

        const res = getTodoListItemEntry(editor);

        if (res && insertTodoListItem(editor)) return true;

        return next();
      },
    },
  });

export const BaseTodoListPlugin = createEditorPlugin({
  key: KEYS.listTodoClassic,
  node: { isElement: true },
  options: {
    inheritCheckStateOnLineEndBreak: false,
    inheritCheckStateOnLineStartBreak: false,
  },
})
  .extend(({ editor }) => ({
    editorExtensions: [createTodoListClassicExtension(editor)],
  }))
  .extendTx(({ editor, type }) => (tx: EditorUpdateTransaction) => ({
    toggle: () => {
      const isActive = tx.nodes.some({
        match: (node: unknown) => isElementOfType(node, type),
      });

      tx.nodes.set({ type: isActive ? editor.getType(KEYS.p) : type });
    },
  }));
