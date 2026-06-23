import type { Element, NodeEntry } from '@platejs/slate';
import type { SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

import { normalizeListSequence } from '../normalizers/normalizeListSequence';
import type { GetSiblingListOptions } from '../queries/getSiblingList';

import { getListSiblings } from '../queries/getListSiblings';
import { ListStyleType } from '../types';
import { setIndentTodoNodeTx, setListNodeTx } from './setListNode';

/** Set indent list to entry + siblings. */
export const setListSiblingNodes = <N extends Element = Element>(
  editor: SlateEditor,
  entry: NodeEntry<Element>,
  {
    getSiblingListOptions,
    listStyleType = ListStyleType.Disc,
  }: {
    getSiblingListOptions?: GetSiblingListOptions<N>;
    listStyleType?: string;
  }
) => {
  editor.update((tx) => {
    const siblings = getListSiblings(editor, entry, getSiblingListOptions);

    siblings.forEach(([node, path]) => {
      if (listStyleType === KEYS.listTodo) {
        tx.nodes.unset(KEYS.listType, { at: path });
        setIndentTodoNodeTx(tx, {
          at: path,
          indent: node[KEYS.indent] as number,
          listStyleType,
        });
      } else {
        tx.nodes.unset(KEYS.listChecked, { at: path });
        setListNodeTx(tx, {
          at: path,
          indent: node[KEYS.indent] as number,
          listStyleType,
        });
      }
    });
  });

  normalizeListSequence(editor, entry[1], getSiblingListOptions);
};
