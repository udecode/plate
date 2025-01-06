import type { Editor, ElementEntryOf, ElementOf } from '@udecode/plate';

import { BaseIndentPlugin } from '@udecode/plate-indent';

import type { GetSiblingIndentListOptions } from '../queries/getSiblingIndentList';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';
import { getIndentListSiblings } from '../queries/getIndentListSiblings';
import { ListStyleType } from '../types';
import { setIndentListNode, setIndentTodoNode } from './setIndentListNode';

/** Set indent list to entry + siblings. */
export const setIndentListSiblingNodes = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  entry: ElementEntryOf<E>,
  {
    getSiblingIndentListOptions,
    listStyleType = ListStyleType.Disc,
  }: {
    getSiblingIndentListOptions?: GetSiblingIndentListOptions<N, E>;
    listStyleType?: string;
  }
) => {
  editor.tf.withoutNormalizing(() => {
    const siblings = getIndentListSiblings(
      editor,
      entry,
      getSiblingIndentListOptions
    );

    siblings.forEach(([node, path]) => {
      if (listStyleType === INDENT_LIST_KEYS.todo) {
        editor.tf.unsetNodes(BaseIndentListPlugin.key, { at: path });
        setIndentTodoNode(editor, {
          at: path,
          indent: node[BaseIndentPlugin.key] as number,
          listStyleType,
        });
      } else {
        editor.tf.unsetNodes(INDENT_LIST_KEYS.checked, { at: path });
        setIndentListNode(editor, {
          at: path,
          indent: node[BaseIndentPlugin.key] as number,
          listStyleType,
        });
      }
    });
  });
};
