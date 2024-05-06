import {
  type EElement,
  type EElementEntry,
  type TEditor,
  type Value,
  unsetNodes,
  withoutNormalizing,
} from '@udecode/plate-common/server';
import { KEY_INDENT } from '@udecode/plate-indent';

import type { GetSiblingIndentListOptions } from '../queries/getSiblingIndentList';

import {
  KEY_LIST_CHECKED,
  KEY_LIST_STYLE_TYPE,
  KEY_TODO_STYLE_TYPE,
} from '../createIndentListPlugin';
import { getIndentListSiblings } from '../queries/getIndentListSiblings';
import { ListStyleType } from '../types';
import { setIndentListNode, setIndentTodoNode } from './setIndentListNode';

/** Set indent list to entry + siblings. */
export const setIndentListSiblingNodes = <
  N extends EElement<V>,
  V extends Value = Value,
>(
  editor: TEditor<V>,
  entry: EElementEntry<V>,
  {
    getSiblingIndentListOptions,
    listStyleType = ListStyleType.Disc,
  }: {
    getSiblingIndentListOptions?: GetSiblingIndentListOptions<N, V>;
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
        unsetNodes(editor as any, KEY_LIST_STYLE_TYPE, { at: path });
        setIndentTodoNode(editor, {
          at: path,
          indent: node[KEY_INDENT] as number,
          listStyleType,
        });
      } else {
        unsetNodes(editor as any, KEY_LIST_CHECKED, { at: path });
        setIndentListNode(editor, {
          at: path,
          indent: node[KEY_INDENT] as number,
          listStyleType,
        });
      }
    });
  });
};
