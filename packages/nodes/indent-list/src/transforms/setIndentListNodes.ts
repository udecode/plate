import {
  TEditor,
  TNodeEntry,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { KEY_INDENT } from '@udecode/plate-indent';
import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';
import { ListStyleType } from '../types';
import { setIndentListNode } from './setIndentListNode';

/**
 * Set indent list to the given entries.
 * Add indent if listStyleType was not defined.
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
      indent = node[KEY_LIST_STYLE_TYPE] ? indent : indent + 1;

      setIndentListNode(editor, {
        listStyleType,
        indent,
        at: path,
      });
    });
  });
};
