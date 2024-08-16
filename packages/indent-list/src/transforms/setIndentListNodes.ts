import {
  type TEditor,
  type TNodeEntry,
  unsetNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import { IndentPlugin } from '@udecode/plate-indent';

import { INDENT_LIST_KEYS, IndentListPlugin } from '../IndentListPlugin';
import { ListStyleType } from '../types';
import { setIndentListNode, setIndentTodoNode } from './setIndentListNode';

/**
 * Set indent list to the given entries. Add indent if listStyleType was not
 * defined.
 */
export const setIndentListNodes = (
  editor: TEditor,
  entries: TNodeEntry[],
  {
    listStyleType = ListStyleType.Disc,
  }: {
    listStyleType?: string;
  }
) => {
  withoutNormalizing(editor, () => {
    entries.forEach((entry) => {
      const [node, path] = entry;

      let indent = (node[IndentPlugin.key] as number) ?? 0;
      indent =
        node[IndentListPlugin.key] ||
        node.hasOwnProperty(INDENT_LIST_KEYS.checked)
          ? indent
          : indent + 1;

      if (listStyleType === 'todo') {
        unsetNodes(editor as any, IndentListPlugin.key, { at: path });
        setIndentTodoNode(editor, {
          at: path,
          indent,
          listStyleType,
        });

        return;
      }

      unsetNodes(editor as any, INDENT_LIST_KEYS.checked, { at: path });
      setIndentListNode(editor, {
        at: path,
        indent,
        listStyleType,
      });
    });
  });
};
