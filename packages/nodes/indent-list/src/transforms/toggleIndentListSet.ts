import { TEditor } from '@udecode/plate-core';
import { KEY_INDENT } from '@udecode/plate-indent';
import { NodeEntry } from 'slate';
import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';
import { ListStyleType } from '../types';
import { setIndentListNode } from './setIndentListNode';

/**
 * Set indent list if not set.
 */
export const toggleIndentListSet = (
  editor: TEditor,
  [node, path]: NodeEntry,
  {
    listStyleType = ListStyleType.Disc,
  }: {
    listStyleType?: string;
  }
) => {
  if (!node[KEY_LIST_STYLE_TYPE]) {
    setIndentListNode(editor, {
      listStyleType,
      indent: node[KEY_INDENT],
      at: path,
    });
    return true;
  }
};
