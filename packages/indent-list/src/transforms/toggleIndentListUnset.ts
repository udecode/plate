import {
  type TEditor,
  type TNodeEntry,
  unsetNodes,
} from '@udecode/plate-common';

import { INDENT_LIST_KEYS, IndentListPlugin } from '../IndentListPlugin';
import { ListStyleType } from '../types';
import { outdentList } from './outdentList';

/** Unset list style type if already set. */
export const toggleIndentListUnset = (
  editor: TEditor,
  [node, path]: TNodeEntry,
  {
    listStyleType = ListStyleType.Disc,
  }: {
    listStyleType?: string;
  }
) => {
  if (
    listStyleType === INDENT_LIST_KEYS.todo &&
    node.hasOwnProperty(INDENT_LIST_KEYS.checked)
  ) {
    unsetNodes(editor as any, INDENT_LIST_KEYS.checked, { at: path });
    outdentList(editor as any, { listStyleType });

    return true;
  }
  if (listStyleType === node[IndentListPlugin.key]) {
    unsetNodes(editor as any, [IndentListPlugin.key], {
      at: path,
    });

    outdentList(editor as any, { listStyleType });

    return true;
  }
};
