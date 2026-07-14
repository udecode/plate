import type { BaseEditor } from '@platejs/core';
import type { Element, NodeEntry } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { ListStyleType } from '../types';
import { type ListOptions, indentList, indentTodo } from './indentList';

/** Set indent list if not set. */
export const toggleListSet = (
  editor: BaseEditor,
  [node, _path]: NodeEntry<Element>,
  { listStyleType = ListStyleType.Disc, ...options }: ListOptions
) => {
  if (Object.hasOwn(node, KEYS.listChecked) || node[KEYS.listType]) return;
  if (listStyleType === 'todo') {
    indentTodo(editor, {
      listStyleType,
      ...options,
    });
  } else {
    indentList(editor, {
      listStyleType,
      ...options,
    });
  }

  return true;
};
