import { Ancestor, Editor } from 'slate';
import { EditorAboveOptions } from '../types/Editor.types';
import { getQueryOptions } from '../utils/match';

/**
 * Get node above a location (default: selection).
 */
export const getAbove = <T = Ancestor>(
  editor: Editor,
  options: EditorAboveOptions<T> = {}
) => {
  return Editor.above(editor, getQueryOptions(editor, options));
};
