import { TEditor, withoutNormalizing } from '@udecode/plate-core';
import { KEY_INDENT } from '@udecode/plate-indent';
import { NodeEntry } from 'slate';
import { ListStyleType } from '../types';
import { setIndentListNode } from './setIndentListNode';

/**
 * Set indent list to the given entries.
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
      const [block, path] = entry;

      setIndentListNode(editor, {
        listStyleType,
        indent: block[KEY_INDENT],
        at: path,
      });
    });
  });
};
