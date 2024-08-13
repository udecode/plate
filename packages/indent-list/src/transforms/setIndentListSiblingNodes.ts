import {
  type ElementEntryOf,
  type ElementOf,
  type TEditor,
  unsetNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import { IndentPlugin } from '@udecode/plate-indent';

import type { GetSiblingIndentListOptions } from '../queries/getSiblingIndentList';

import {
  IndentListPlugin,
  KEY_LIST_CHECKED,
  KEY_TODO_STYLE_TYPE,
} from '../IndentListPlugin';
import { getIndentListSiblings } from '../queries/getIndentListSiblings';
import { ListStyleType } from '../types';
import { setIndentListNode, setIndentTodoNode } from './setIndentListNode';

/** Set indent list to entry + siblings. */
export const setIndentListSiblingNodes = <
  N extends ElementOf<E>,
  E extends TEditor = TEditor,
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
  withoutNormalizing(editor, () => {
    const siblings = getIndentListSiblings(
      editor,
      entry,
      getSiblingIndentListOptions
    );

    siblings.forEach(([node, path]) => {
      if (listStyleType === KEY_TODO_STYLE_TYPE) {
        unsetNodes(editor as any, IndentListPlugin.key, { at: path });
        setIndentTodoNode(editor, {
          at: path,
          indent: node[IndentPlugin.key] as number,
          listStyleType,
        });
      } else {
        unsetNodes(editor as any, KEY_LIST_CHECKED, { at: path });
        setIndentListNode(editor, {
          at: path,
          indent: node[IndentPlugin.key] as number,
          listStyleType,
        });
      }
    });
  });
};
