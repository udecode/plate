import type { Editor, NodeEntry } from '@udecode/plate';

import { INDENT_LIST_KEYS } from '../BaseListPlugin';
import { ListStyleType } from '../types';
import { outdentList } from './outdentList';

/** Unset list style type if already set. */
export const toggleListUnset = (
  editor: Editor,
  [node, path]: NodeEntry,
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
    editor.tf.unsetNodes(INDENT_LIST_KEYS.checked, { at: path });
    outdentList(editor as any, { listStyleType });

    return true;
  }
  if (listStyleType === node[INDENT_LIST_KEYS.listStyleType]) {
    editor.tf.unsetNodes([INDENT_LIST_KEYS.listStyleType], {
      at: path,
    });

    outdentList(editor as any, { listStyleType });

    return true;
  }
};
