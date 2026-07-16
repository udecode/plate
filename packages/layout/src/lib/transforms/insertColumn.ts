import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateTransaction,
  Element,
  NodeInsertNodesOptions,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export type InsertColumnOptions = NodeInsertNodesOptions<Element> & {
  width?: string;
};

export const insertColumn = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { width = '33%', ...options }: InsertColumnOptions = {}
) => {
  tx.nodes.insert(
    {
      children: [{ children: [{ text: '' }], type: editor.getType(KEYS.p) }],
      type: editor.getType(KEYS.column),
      width,
    },
    options
  );
};
