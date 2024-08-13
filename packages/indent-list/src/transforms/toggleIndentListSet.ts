import type { TEditor, TNodeEntry } from '@udecode/plate-common';

import { KEY_LIST_CHECKED, KEY_LIST_STYLE_TYPE } from '../IndentListPlugin';
import { ListStyleType } from '../types';
import { type IndentListOptions, indentList, indentTodo } from './indentList';

/** Set indent list if not set. */
export const toggleIndentListSet = <E extends TEditor>(
  editor: E,
  [node, _path]: TNodeEntry,
  { listStyleType = ListStyleType.Disc, ...options }: IndentListOptions<E>
) => {
  if (node.hasOwnProperty(KEY_LIST_CHECKED) || node[KEY_LIST_STYLE_TYPE])
    return;
  if (listStyleType === 'todo') {
    indentTodo(editor as any, {
      listStyleType,
      ...options,
    });
  } else {
    indentList(editor as any, {
      listStyleType,
      ...options,
    });
  }

  return true;
};
