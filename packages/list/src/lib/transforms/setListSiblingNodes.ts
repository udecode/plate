import type { BaseEditor } from '@platejs/core';
import type { Element, NodeEntry } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { GetSiblingListOptions } from '../queries/getSiblingList';

import { getListSiblings } from '../queries/getListSiblings';
import { ListStyleType } from '../types';
import { setIndentTodoNode, setListNode } from './setListNode';

/** Set indent list to entry + siblings. */
export const setListSiblingNodes = <N extends Element = Element>(
  editor: BaseEditor,
  entry: NodeEntry<Element>,
  {
    getSiblingListOptions,
    listStyleType = ListStyleType.Disc,
  }: {
    getSiblingListOptions?: GetSiblingListOptions<N>;
    listStyleType?: string;
  }
) => {
  editor.update.withoutNormalizing(() => {
    const siblings = getListSiblings(editor, entry, getSiblingListOptions);

    siblings.forEach(([node, path]) => {
      if (listStyleType === KEYS.listTodo) {
        editor.update.nodes.unset(KEYS.listType, { at: path });
        setIndentTodoNode(editor, {
          at: path,
          indent: node[KEYS.indent] as number,
          listStyleType,
        });
      } else {
        editor.update.nodes.unset(KEYS.listChecked, { at: path });
        setListNode(editor, {
          at: path,
          indent: node[KEYS.indent] as number,
          listStyleType,
        });
      }
    });
  });
};
