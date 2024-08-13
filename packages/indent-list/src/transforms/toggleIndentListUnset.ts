import {
  type TEditor,
  type TNodeEntry,
  unsetNodes,
} from '@udecode/plate-common';

import {
  IndentListPlugin,
  KEY_LIST_CHECKED,
  KEY_TODO_STYLE_TYPE,
} from '../IndentListPlugin';
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
    listStyleType === KEY_TODO_STYLE_TYPE &&
    node.hasOwnProperty(KEY_LIST_CHECKED)
  ) {
    unsetNodes(editor as any, KEY_LIST_CHECKED, { at: path });
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
