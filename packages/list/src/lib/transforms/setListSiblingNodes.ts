import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateTransaction,
  Element,
  NodeEntry,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { GetSiblingListOptions } from '../queries/getSiblingList';

import { getListSiblings } from '../queries/getListSiblings';
import { ListStyleType } from '../types';

export const setListSiblingNodesWithTx = <N extends Element = Element>(
  editor: BaseEditor,
  tx: Pick<EditorUpdateTransaction, 'nodes'>,
  entry: NodeEntry<Element>,
  {
    getSiblingListOptions,
    listStyleType = ListStyleType.Disc,
  }: {
    getSiblingListOptions?: GetSiblingListOptions<N>;
    listStyleType?: string;
  }
) => {
  const siblings = getListSiblings(editor, entry, getSiblingListOptions, tx);

  siblings.forEach(([node, path]) => {
    if (listStyleType === KEYS.listTodo) {
      const indent = (node[KEYS.indent] as number | undefined) ?? 0;

      tx.nodes.unset(KEYS.listType, { at: path });
      tx.nodes.set(
        {
          [KEYS.indent]: indent || indent + 1,
          [KEYS.listChecked]: false,
          [KEYS.listType]: listStyleType,
        },
        { at: path }
      );
    } else {
      const indent = (node[KEYS.indent] as number | undefined) ?? 0;

      tx.nodes.unset(KEYS.listChecked, { at: path });
      tx.nodes.set(
        {
          [KEYS.indent]: indent || indent + 1,
          [KEYS.listType]: listStyleType,
        },
        { at: path }
      );
    }
  });
};
