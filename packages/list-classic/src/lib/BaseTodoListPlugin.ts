import type {
  EditorExtensionInput,
  EditorUpdateTransaction,
  Element,
} from '@platejs/slate';
import { createSlatePlugin } from '@platejs/core';
import { defineEditorExtension } from '@platejs/slate';
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

export const BaseTodoListPlugin = createSlatePlugin({
  key: KEYS.listTodoClassic,
  node: { isElement: true },
  options: {
    inheritCheckStateOnLineEndBreak: false,
    inheritCheckStateOnLineStartBreak: false,
  },
})
  .extend(({ editor }) => ({
    slateExtensions: [createTodoListClassicExtension(editor)],
  }))
  .extendTx(({ editor, type }) => (tx: EditorUpdateTransaction) => ({
    toggle: () => {
      const isActive = tx.nodes.some({
        match: (node: unknown) => isElementOfType(node, type),
      });

      tx.nodes.set({ type: isActive ? editor.getType(KEYS.p) : type });
    },
  }));
