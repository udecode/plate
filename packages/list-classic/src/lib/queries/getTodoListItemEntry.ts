import type { BaseEditor } from '@platejs/core';
import {
  type Element,
  type ElementEntry,
  type Location,
  type Path,
  RangeApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/**
 * Returns the nearest li and ul / ol wrapping node entries for a given path
 * (default = selection)
 */
export const getTodoListItemEntry = (
  editor: BaseEditor,
  { at = editor.read.selection() }: { at?: Location | null } = {}
): { list: ElementEntry; listItem: ElementEntry } | undefined => {
  const todoType = editor.getType(KEYS.listTodoClassic);

  let _at: Path;

  if (RangeApi.isRange(at) && !RangeApi.isCollapsed(at)) {
    _at = at.focus.path;
  } else if (RangeApi.isRange(at)) {
    _at = at.anchor.path;
  } else {
    _at = at as Path;
  }
  if (_at) {
    const node = editor.read.nodes.get<Element>(_at);

    if (node) {
      const listItem = editor.read.nodes.above<Element>({
        at: _at,
        match: { type: todoType },
      });

      if (listItem) {
        const list = editor.read.nodes.parent<Element>(listItem[1])!;

        return { list, listItem };
      }
    }
  }
};
