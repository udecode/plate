import {
  type NodeEntry,
  type Path,
  type TElement,
  PathApi,
} from '@udecode/plate';
import { type PlateEditor, getEditorPlugin } from '@udecode/plate/react';

import type { BlockSelectionPlugin } from '../../BlockSelectionPlugin';

export const getNextSelectable = (
  editor: PlateEditor,
  path: Path
): NodeEntry<TElement> | undefined => {
  const { getOptions } = getEditorPlugin<typeof BlockSelectionPlugin>(editor, {
    key: 'blockSelection',
  });
  const isSelectable = getOptions().isSelectable;

  const entry = editor.api.node<TElement>(path);

  if (entry) {
    const firstChild = entry[0].children[0] as TElement;
    const firstPath = PathApi.firstChild(path);
    console.log(firstChild, editor.api.isBlock(firstChild));

    if (editor.api.isBlock(firstChild)) {
      if (!isSelectable(firstChild, firstPath)) {
        return getNextSelectable(editor, firstPath);
      }

      return [firstChild, firstPath];
    }
  }

  const nextEntry = editor.api.next<TElement & { id: string }>({
    at: path,
    block: true,
    match: (n, p) => !PathApi.isCommon(p, path),
    mode: 'highest',
  });

  if (nextEntry) console.log(path, nextEntry);
  if (!nextEntry) return;
  // If the next block is selectable, check if it has selectable children
  if (!isSelectable(...nextEntry)) {
    return getNextSelectable(editor, nextEntry[1]);
  }

  return nextEntry;
};
