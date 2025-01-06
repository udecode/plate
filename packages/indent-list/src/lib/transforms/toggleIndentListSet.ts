import type { Editor, TNodeEntry } from '@udecode/plate-common';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';
import { ListStyleType } from '../types';
import { type IndentListOptions, indentList, indentTodo } from './indentList';

/** Set indent list if not set. */
export const toggleIndentListSet = (
  editor: Editor,
  [node, _path]: TNodeEntry,
  { listStyleType = ListStyleType.Disc, ...options }: IndentListOptions
) => {
  if (
    node.hasOwnProperty(INDENT_LIST_KEYS.checked) ||
    node[BaseIndentListPlugin.key]
  )
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
