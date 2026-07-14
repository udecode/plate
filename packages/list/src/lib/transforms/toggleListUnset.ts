import type { BaseEditor } from '@platejs/core';
import type { Element, NodeEntry } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { ListStyleType } from '../types';
import { outdentList } from './outdentList';

/** Unset list style type if already set. */
export const toggleListUnset = (
  editor: BaseEditor,
  [node, path]: NodeEntry<Element>,
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
    editor.update.nodes.unset(KEYS.listChecked, { at: path });
    outdentList(editor, { listStyleType });

    return true;
  }
  if (listStyleType === node[KEYS.listType]) {
    editor.update.nodes.unset([KEYS.listType], {
      at: path,
    });

    outdentList(editor, { listStyleType });

    return true;
  }
};
