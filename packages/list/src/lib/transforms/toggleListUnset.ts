import type { Editor, NodeEntry } from 'platejs';

import { KEYS } from 'platejs';

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
    listStyleType === KEYS.listTodo &&
    Object.hasOwn(node, KEYS.listChecked)
  ) {
    editor.tf.unsetNodes(KEYS.listChecked, { at: path });
    outdentList(editor as any, { listStyleType });

    return true;
  }
  if (listStyleType === node[KEYS.listType]) {
    editor.tf.unsetNodes([KEYS.listType], {
      at: path,
    });

    outdentList(editor as any, { listStyleType });

    return true;
  }
};
