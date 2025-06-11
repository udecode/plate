import type { Editor, ElementEntryOf, ElementOf } from 'platejs';

import { KEYS } from 'platejs';

import type { GetSiblingListOptions } from '../queries/getSiblingList';

import { getListSiblings } from '../queries/getListSiblings';
import { ListStyleType } from '../types';
import { setIndentTodoNode, setListNode } from './setListNode';

/** Set indent list to entry + siblings. */
export const setListSiblingNodes = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  entry: ElementEntryOf<E>,
  {
    getSiblingListOptions,
    listStyleType = ListStyleType.Disc,
  }: {
    getSiblingListOptions?: GetSiblingListOptions<N, E>;
    listStyleType?: string;
  }
) => {
  editor.tf.withoutNormalizing(() => {
    const siblings = getListSiblings(editor, entry, getSiblingListOptions);

    siblings.forEach(([node, path]) => {
      if (listStyleType === KEYS.listTodo) {
        editor.tf.unsetNodes(KEYS.listType, { at: path });
        setIndentTodoNode(editor, {
          at: path,
          indent: node[KEYS.indent] as number,
          listStyleType,
        });
      } else {
        editor.tf.unsetNodes(KEYS.listChecked, { at: path });
        setListNode(editor, {
          at: path,
          indent: node[KEYS.indent] as number,
          listStyleType,
        });
      }
    });
  });
};
