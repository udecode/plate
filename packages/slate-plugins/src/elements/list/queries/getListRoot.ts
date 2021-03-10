import { getAbove } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Ancestor, Editor, NodeEntry, Path, Point, Range } from 'slate';

/**
 * Searches upward for the root list element
 */
export const getListRoot = (
  editor: Editor,
  at: Path | Range | Point | null = editor.selection,
  options: SlatePluginsOptions
): NodeEntry<Ancestor> | undefined => {
  if (!at) return;

  const { ol, ul } = options;

  const parentList = getAbove(editor, {
    at,
    match: { type: [ul.type, ol.type] },
  });

  if (parentList) {
    const [, parentListPath] = parentList;

    return getListRoot(editor, parentListPath, options) ?? parentList;
  }
};
