import type { Editor, ElementEntryOf, ElementOf } from '@udecode/plate';

import { BaseIndentPlugin } from '@udecode/plate-indent';

import type { GetSiblingListOptions } from '../queries/getSiblingList';

import { INDENT_LIST_KEYS } from '../BaseListPlugin';
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
      if (listStyleType === INDENT_LIST_KEYS.todo) {
        editor.tf.unsetNodes(INDENT_LIST_KEYS.listStyleType, { at: path });
        setIndentTodoNode(editor, {
          at: path,
          indent: node[BaseIndentPlugin.key] as number,
          listStyleType,
        });
      } else {
        editor.tf.unsetNodes(INDENT_LIST_KEYS.checked, { at: path });
        setListNode(editor, {
          at: path,
          indent: node[BaseIndentPlugin.key] as number,
          listStyleType,
        });
      }
    });
  });
};
