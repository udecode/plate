import { TAncestor } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { EditorAboveOptions } from '../types/Editor.types';
import { getQueryOptions } from './match';

/**
 * Get node above a location (default: selection).
 */
export const getAbove = <T extends TAncestor = TAncestor>(
  editor: Editor,
  options: EditorAboveOptions<T> = {}
) => {
  return Editor.above<T>(editor, getQueryOptions(editor, options));
};
