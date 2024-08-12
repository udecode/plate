import {
  type PlateEditor,
  type TElement,
  type TElementEntry,
  getAboveNode,
  getNode,
  getParentNode,
  getPluginType,
  isCollapsed,
} from '@udecode/plate-common';
import { type Location, type Path, Range } from 'slate';

import { ELEMENT_TODO_LI } from '../todo-list/TodoListPlugin';

/**
 * Returns the nearest li and ul / ol wrapping node entries for a given path
 * (default = selection)
 */
export const getTodoListItemEntry = (
  editor: PlateEditor,
  { at = editor.selection }: { at?: Location | null } = {}
): { list: TElementEntry; listItem: TElementEntry } | undefined => {
  const todoType = getPluginType(editor, ELEMENT_TODO_LI);

  let _at: Path;

  if (Range.isRange(at) && !isCollapsed(at)) {
    _at = at.focus.path;
  } else if (Range.isRange(at)) {
    _at = at.anchor.path;
  } else {
    _at = at as Path;
  }
  if (_at) {
    const node = getNode<TElement>(editor, _at);

    if (node) {
      const listItem = getAboveNode<TElement>(editor, {
        at: _at,
        match: { type: todoType },
      });

      if (listItem) {
        const list = getParentNode<TElement>(editor, listItem[1])!;

        return { list, listItem };
      }
    }
  }
};
