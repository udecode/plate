import type { NodeEntry, Path, TElement } from '@udecode/plate';

import { type PlateEditor, getEditorPlugin } from '@udecode/plate/react';

import type { BlockSelectionPlugin } from '../../BlockSelectionPlugin';

export const getPreviousSelectable = (
  editor: PlateEditor,
  path: Path
): NodeEntry<TElement> | undefined => {
  const { getOptions } = getEditorPlugin<typeof BlockSelectionPlugin>(editor, {
    key: 'blockSelection',
  });
  const isSelectable = getOptions().isSelectable;

  const isFirst = path.length > 1 && path.at(-1) === 0;

  if (isFirst) {
    const parentEntry = editor.api.parent<TElement & { id: string }>(path)!;

    // eslint-disable-next-line unicorn/prefer-ternary
    if (isSelectable?.(...parentEntry)) {
      return parentEntry;
    } else {
      return getPreviousSelectable(editor, parentEntry[1]);
    }
  }

  const prevEntry = editor.api.previous<TElement & { id: string }>({
    at: path,
    block: true,
    mode: 'lowest',
  });

  if (!prevEntry) return;

  console.log(1, prevEntry, isSelectable(...prevEntry));

  if (!isSelectable(...prevEntry)) {
    return getPreviousSelectable(editor, prevEntry[1]);
  }

  console.log('PREV', prevEntry);

  return prevEntry;
};
