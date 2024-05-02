import {
  EElement,
  EElementEntry,
  TEditor,
  unsetNodes,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common/server';
import { KEY_INDENT } from '@udecode/plate-indent';

import {
  KEY_LIST_CHECKED,
  KEY_LIST_STYLE_TYPE,
  KEY_TODO_STYLE_TYPE,
} from '../createIndentListPlugin';
import { getIndentListSiblings } from '../queries/getIndentListSiblings';
import { GetSiblingIndentListOptions } from '../queries/getSiblingIndentList';
import { ListStyleType } from '../types';
import { setIndentListNode, setIndentTodoNode } from './setIndentListNode';

/**
 * Set indent list to entry + siblings.
 */
export const setIndentListSiblingNodes = <
  N extends EElement<V>,
  V extends Value = Value,
>(
  editor: TEditor<V>,
  entry: EElementEntry<V>,
  {
    listStyleType = ListStyleType.Disc,
    getSiblingIndentListOptions,
  }: {
    listStyleType?: string;
    getSiblingIndentListOptions?: GetSiblingIndentListOptions<N, V>;
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
          listStyleType,
          indent: node[KEY_INDENT] as number,
          at: path,
        });
      } else {
        unsetNodes(editor as any, KEY_LIST_CHECKED, { at: path });
        setIndentListNode(editor, {
          listStyleType,
          indent: node[KEY_INDENT] as number,
          at: path,
        });
      }
    });
  });
};
