import {
  type TEditor,
  type TNodeEntry,
  type Value,
  unsetNodes,
  withoutNormalizing,
} from '@udecode/plate-common/server';
import { KEY_INDENT } from '@udecode/plate-indent';

import {
  KEY_LIST_CHECKED,
  KEY_LIST_STYLE_TYPE,
} from '../createIndentListPlugin';
import { ListStyleType } from '../types';
import { setIndentListNode, setIndentTodoNode } from './setIndentListNode';

/**
 * Set indent list to the given entries. Add indent if listStyleType was not
 * defined.
 */
export const setIndentListNodes = <V extends Value>(
  editor: TEditor<V>,
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

      let indent = (node[KEY_INDENT] as number) ?? 0;
      indent =
        node[KEY_LIST_STYLE_TYPE] || node.hasOwnProperty(KEY_LIST_CHECKED)
          ? indent
          : indent + 1;

      if (listStyleType === 'todo') {
        unsetNodes(editor as any, KEY_LIST_STYLE_TYPE, { at: path });
        setIndentTodoNode(editor, {
          at: path,
          indent,
          listStyleType,
        });

        return;
      }

      unsetNodes(editor as any, KEY_LIST_CHECKED, { at: path });
      setIndentListNode(editor, {
        at: path,
        indent,
        listStyleType,
      });
    });
  });
};
