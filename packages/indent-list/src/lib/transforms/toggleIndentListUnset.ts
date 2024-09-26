import {
  type TEditor,
  type TNodeEntry,
  unsetNodes,
} from '@udecode/plate-common';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';
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
  if (listStyleType === node[BaseIndentListPlugin.key]) {
    unsetNodes(editor as any, [BaseIndentListPlugin.key], {
      at: path,
    });

    outdentList(editor as any, { listStyleType });

    return true;
  }
};
