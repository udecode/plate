import type { Editor, NodeEntry } from 'platejs';

import { KEYS } from 'platejs';

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

      let indent = (node[KEYS.indent] as number) ?? 0;
      indent =
        node[KEYS.listType] || Object.hasOwn(node, KEYS.listChecked)
          ? indent
          : indent + 1;

      if (listStyleType === 'todo') {
        editor.tf.unsetNodes(KEYS.listType, { at: path });
        setIndentTodoNode(editor, {
          at: path,
          indent,
          listStyleType,
        });

        return;
      }

      editor.tf.unsetNodes(KEYS.listChecked, { at: path });
      setListNode(editor, {
        at: path,
        indent,
        listStyleType,
      });
    });
  });
};
