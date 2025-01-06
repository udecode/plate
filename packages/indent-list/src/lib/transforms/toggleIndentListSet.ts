import type { Editor, NodeEntry } from '@udecode/plate';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';
import { ListStyleType } from '../types';
import { type IndentListOptions, indentList, indentTodo } from './indentList';

/** Set indent list if not set. */
export const toggleIndentListSet = (
  editor: Editor,
  [node, _path]: NodeEntry,
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
