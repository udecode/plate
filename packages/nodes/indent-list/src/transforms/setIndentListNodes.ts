import { TEditor, withoutNormalizing } from '@udecode/plate-core';
import { KEY_INDENT } from '@udecode/plate-indent';
import { NodeEntry } from 'slate';
import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';
import { ListStyleType } from '../types';
import { setIndentListNode } from './setIndentListNode';

/**
 * Set indent list to the given entries.
 * Add indent if listStyleType was not defined.
 */
export const setIndentListNodes = (
  editor: TEditor,
  entries: NodeEntry[],
  {
    listStyleType = ListStyleType.Disc,
  }: {
    listStyleType?: string;
  }
) => {
  withoutNormalizing(editor, () => {
    entries.forEach((entry) => {
      const [node, path] = entry;

      let indent = node[KEY_INDENT] ?? 0;
      indent = node[KEY_LIST_STYLE_TYPE] ? indent : indent + 1;

      setIndentListNode(editor, {
        listStyleType,
        indent,
        at: path,
      });
    });
  });
};
