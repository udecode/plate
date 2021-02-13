import { Ancestor, Editor, NodeEntry, Path, Point, Range } from 'slate';
import { getAbove, setDefaults } from '../../../common';
import { DEFAULTS_LIST } from '../defaults';
import { ListOptions } from '../types';

/**
 * Searches upward for the root list element
 */
export const getListRoot = (
  editor: Editor,
  at: Path | Range | Point | null = editor.selection,
  options?: ListOptions
): NodeEntry<Ancestor> | undefined => {
  if (!at) return;

  const { ol, ul } = setDefaults(options, DEFAULTS_LIST);

  const parentList = getAbove(editor, {
    at,
    match: { type: [ul.type, ol.type] },
  });

  if (parentList) {
    const [, parentListPath] = parentList;

    return getListRoot(editor, parentListPath, options) ?? parentList;
  }
};
