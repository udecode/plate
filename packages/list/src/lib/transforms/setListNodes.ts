import type {
  EditorUpdateTransaction,
  Element,
  NodeEntry,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { ListStyleType } from '../types';

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
