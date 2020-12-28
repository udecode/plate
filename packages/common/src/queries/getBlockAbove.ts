import { Ancestor, Editor, NodeEntry } from 'slate';
import { EditorAboveOptions } from '../types/Editor.types';

/**
 * Get the block above a location (default: selection).
 * If not found, return the editor entry.
 */
export const getBlockAbove = (
  editor: Editor,
  options: Omit<EditorAboveOptions, 'match'> = {}
): NodeEntry<Ancestor> =>
  Editor.above(editor, {
    match: (n) => Editor.isBlock(editor, n),
    ...options,
  }) || [editor, []];
