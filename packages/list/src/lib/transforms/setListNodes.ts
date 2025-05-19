import type { Editor, NodeEntry } from '@udecode/plate';

import { BaseIndentPlugin } from '@udecode/plate-indent';

import { INDENT_LIST_KEYS } from '../BaseListPlugin';
import { ListStyleType } from '../types';
import { setIndentTodoNode, setListNode } from './setListNode';

/**
 * Set indent list to the given entries. Add indent if listStyleType was not
 * defined.
 */
export const setListNodes = (
  editor: Editor,
  entries: NodeEntry[],
  {
    listStyleType = ListStyleType.Disc,
  }: {
    listStyleType?: string;
  }
) => {
  editor.tf.withoutNormalizing(() => {
    entries.forEach((entry) => {
      const [node, path] = entry;

      let indent = (node[BaseIndentPlugin.key] as number) ?? 0;
      indent =
        node[INDENT_LIST_KEYS.listStyleType] ||
        node.hasOwnProperty(INDENT_LIST_KEYS.checked)
          ? indent
          : indent + 1;

      if (listStyleType === 'todo') {
        editor.tf.unsetNodes(INDENT_LIST_KEYS.listStyleType, { at: path });
        setIndentTodoNode(editor, {
          at: path,
          indent,
          listStyleType,
        });

        return;
      }

      editor.tf.unsetNodes(INDENT_LIST_KEYS.checked, { at: path });
      setListNode(editor, {
        at: path,
        indent,
        listStyleType,
      });
    });
  });
};
