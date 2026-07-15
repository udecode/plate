import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateTransaction,
  Element,
  NodeEntry,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { ListStyleType } from '../types';

/**
 * Set indent list to the given entries. Add indent if listStyleType was not
 * defined.
 */
export const setListNodes = (
  editor: BaseEditor,
  entries: NodeEntry<Element>[],
  {
    listStyleType = ListStyleType.Disc,
  }: {
    listStyleType?: string;
  }
) => {
  editor.update((tx) => setListNodesWithTx(tx, entries, { listStyleType }));
};

export const setListNodesWithTx = (
  tx: Pick<EditorUpdateTransaction, 'nodes'>,
  entries: NodeEntry<Element>[],
  {
    listStyleType = ListStyleType.Disc,
  }: {
    listStyleType?: string;
  }
) => {
  entries.forEach((entry) => {
    const [node, path] = entry;

    let indent = (node[KEYS.indent] as number) ?? 0;
    indent =
      node[KEYS.listType] || Object.hasOwn(node, KEYS.listChecked)
        ? indent
        : indent + 1;

    if (listStyleType === 'todo') {
      tx.nodes.unset(KEYS.listType, { at: path });
      tx.nodes.set(
        {
          [KEYS.indent]: indent || indent + 1,
          [KEYS.listChecked]: false,
          [KEYS.listType]: listStyleType,
        },
        { at: path }
      );

      return;
    }

    tx.nodes.unset(KEYS.listChecked, { at: path });
    tx.nodes.set(
      {
        [KEYS.indent]: indent || indent + 1,
        [KEYS.listType]: listStyleType,
      },
      { at: path }
    );
  });
};
