import type { BaseEditor } from '@platejs/core';
import type { Element, NodeEntry } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { ListStyleType } from '../types';
import { setIndentTodoNode, setListNode } from './setListNode';

/**
 * Set indent list to the given entries. Add indent if listStyleType was not
 * defined.
 */
export const setListNodes = (
  editor: BaseEditor,
  entries: NodeEntry<Element>[],
  {
    listStyleType = ListStyleType.Disc,
  }: {
    listStyleType?: string;
  }
) => {
  editor.update.withoutNormalizing(() => {
    entries.forEach((entry) => {
      const [node, path] = entry;

      let indent = (node[KEYS.indent] as number) ?? 0;
      indent =
        node[KEYS.listType] || Object.hasOwn(node, KEYS.listChecked)
          ? indent
          : indent + 1;

      if (listStyleType === 'todo') {
        editor.update.nodes.unset(KEYS.listType, { at: path });
        setIndentTodoNode(editor, {
          at: path,
          indent,
          listStyleType,
        });

        return;
      }

      editor.update.nodes.unset(KEYS.listChecked, { at: path });
      setListNode(editor, {
        at: path,
        indent,
        listStyleType,
      });
    });
  });
};
