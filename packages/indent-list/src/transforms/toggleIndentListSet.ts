import { TEditor, TNodeEntry, Value } from '@udecode/plate-common';

import {
  KEY_LIST_CHECKED,
  KEY_LIST_STYLE_TYPE,
} from '../createIndentListPlugin';
import { ListStyleType } from '../types';
import { indentList, IndentListOptions, indentTodo } from './indentList';

/**
 * Set indent list if not set.
 */
export const toggleIndentListSet = <V extends Value>(
  editor: TEditor<V>,
  [node, path]: TNodeEntry,
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
