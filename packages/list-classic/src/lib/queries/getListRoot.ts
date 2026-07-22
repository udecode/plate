import type { BaseEditor } from '@platejs/core';
import type {
  EditorStateView,
  Element,
  ElementEntry,
  Path,
  Point,
  Range,
} from '@platejs/plite';

import { getListTypes } from './getListTypes';

/** Searches upward for the root list element */
export const getListRoot = (
  editor: BaseEditor,
  at: Path | Point | Range | null | undefined,
  state: Pick<EditorStateView, 'nodes' | 'selection'> = editor.read
): ElementEntry | undefined => {
  const location = at === undefined ? state.selection() : at;

  if (!location) return;

  const parentList = state.nodes.above<Element>({
    at: location,
    match: {
      type: getListTypes(editor),
    },
  });

  if (parentList) {
    const [, parentListPath] = parentList;

    return getListRoot(editor, parentListPath, state) ?? parentList;
  }
};
