import type { NodeEntry } from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

import { KEYS } from 'platejs';

import { ListStyleType } from '../types';
import { type ListOptions, indentList, indentTodo } from './indentList';

/** Set indent list if not set. */
export const toggleListSet = (
  editor: BasePlateEditor,
  [node, _path]: NodeEntry,
  { listStyleType = ListStyleType.Disc, ...options }: ListOptions
) => {
  const nodeProps = node as Record<string, unknown>;

  if (Object.hasOwn(nodeProps, KEYS.listChecked) || nodeProps[KEYS.listType])
    return;
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
