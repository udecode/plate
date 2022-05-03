import { TEditor, TNodeEntry, withoutNormalizing } from '@udecode/plate-core';
import { KEY_INDENT } from '@udecode/plate-indent';
import { getIndentListSiblings } from '../queries/getIndentListSiblings';
import { GetSiblingIndentListOptions } from '../queries/getSiblingIndentList';
import { ListStyleType } from '../types';
import { setIndentListNode } from './setIndentListNode';

/**
 * Set indent list to entry + siblings.
 */
export const setIndentListSiblingNodes = (
  editor: TEditor,
  entry: TNodeEntry,
  {
    listStyleType = ListStyleType.Disc,
    getSiblingIndentListOptions,
  }: {
    listStyleType?: string;
    getSiblingIndentListOptions?: GetSiblingIndentListOptions;
  }
) => {
  withoutNormalizing(editor, () => {
    const siblings = getIndentListSiblings(
      editor,
      entry,
      getSiblingIndentListOptions
    );

    siblings.forEach(([node, path]) => {
      setIndentListNode(editor, {
        listStyleType,
        indent: node[KEY_INDENT],
        at: path,
      });
    });
  });
};
