import type { Editor, NodeEntry } from '@udecode/plate';

import { BaseIndentPlugin } from '@udecode/plate-indent';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';
import { ListStyleType } from '../types';
import { setIndentListNode, setIndentTodoNode } from './setIndentListNode';

/**
 * Set indent list to the given entries. Add indent if listStyleType was not
 * defined.
 */
export const setIndentListNodes = (
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
        node[BaseIndentListPlugin.key] ||
        node.hasOwnProperty(INDENT_LIST_KEYS.checked)
          ? indent
          : indent + 1;

      if (listStyleType === 'todo') {
        editor.tf.unsetNodes(BaseIndentListPlugin.key, { at: path });
        setIndentTodoNode(editor, {
          at: path,
          indent,
          listStyleType,
        });

        return;
      }

      editor.tf.unsetNodes(INDENT_LIST_KEYS.checked, { at: path });
      setIndentListNode(editor, {
        at: path,
        indent,
        listStyleType,
      });
    });
  });
};
