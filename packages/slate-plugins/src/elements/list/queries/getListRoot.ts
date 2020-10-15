import { Ancestor, Editor, NodeEntry, Path, Point, Range } from 'slate';
import { setDefaults } from '../../../common';
import { DEFAULTS_LIST } from '../defaults';
import { ListOptions } from '../types';

/**
 * Searches upward for the root list element
 */
export function getListRoot(
  editor: Editor,
  at: Path | Range | Point | null = editor.selection,
  options?: ListOptions
): NodeEntry<Ancestor> | undefined {
  if (!at) {
    return;
  }

  const { ol, ul } = setDefaults(options, DEFAULTS_LIST);
  const list = Editor.above(editor, {
    at,
    match: (node) => node.type === ol.type || node.type === ul.type,
  });

  if (list) {
    return getListRoot(editor, list[1], options) ?? list;
  }
}
