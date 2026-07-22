import type { BaseEditor } from '@platejs/core';
import {
  type Element,
  type ElementEntry,
  type EditorStateView,
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
  { at }: { at?: Location | null } = {},
  state: Pick<EditorStateView, 'nodes' | 'selection'> = editor.read
): { list: ElementEntry; listItem: ElementEntry } | undefined => {
  const todoType = editor.getType(KEYS.listTodoClassic);
  const location = at === undefined ? state.selection() : at;

  let _at: Path;

  if (RangeApi.isRange(location) && !RangeApi.isCollapsed(location)) {
    _at = location.focus.path;
  } else if (RangeApi.isRange(location)) {
    _at = location.anchor.path;
  } else {
    _at = location as Path;
  }
  if (_at) {
    const node = state.nodes.get<Element>(_at);

    if (node) {
      const listItem = state.nodes.above<Element>({
        at: _at,
        match: { type: todoType },
      });

      if (listItem) {
        const list = state.nodes.parent<Element>(listItem[1])!;

        return { list, listItem };
      }
    }
  }
};
