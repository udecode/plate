import { Ancestor, Editor, NodeEntry } from 'slate';
import { EditorAboveOptions } from '../types/Editor.types';

/**
 * Get the block above a location (default: selection).
 */
export const getBlockAbove = <T extends Ancestor>(
  editor: Editor,
  options: Omit<EditorAboveOptions, 'match'> = {}
): NodeEntry<T> =>
  Editor.above(editor, {
    match: (n) => Editor.isBlock(editor, n),
    ...options,
  }) || [editor as T, []];
