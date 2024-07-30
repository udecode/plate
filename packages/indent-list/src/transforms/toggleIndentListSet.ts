import type { TEditor, TNodeEntry, Value } from '@udecode/plate-common/server';

import { KEY_LIST_CHECKED, KEY_LIST_STYLE_TYPE } from '../IndentListPlugin';
import { ListStyleType } from '../types';
import { type IndentListOptions, indentList, indentTodo } from './indentList';

/** Set indent list if not set. */
export const toggleIndentListSet = <V extends Value>(
  editor: TEditor<V>,
  [node, _path]: TNodeEntry,
  { listStyleType = ListStyleType.Disc, ...options }: IndentListOptions<V>
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
