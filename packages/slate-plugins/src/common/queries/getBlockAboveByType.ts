import castArray from 'lodash/castArray';
import { Ancestor, Editor, NodeEntry } from 'slate';
import { EditorAboveOptions } from '../types/Editor.types';

/**
 * Get the block above a location (default: selection) by type.
 */
export const getBlockAboveByType = <T extends Ancestor>(
  editor: Editor,
  types: string[] | string,
  options: Omit<EditorAboveOptions, 'match'> = {}
): NodeEntry<T> | undefined => {
  types = castArray<string>(types);

  return Editor.above(editor, {
    match: (n) => Editor.isBlock(editor, n) && types.includes(n.type as string),
    ...options,
  });
};
