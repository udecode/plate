import { TAncestor } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { EditorAboveOptions } from '../types/Editor.types';
import { getAbove } from './getAbove';

/**
 * Get the block above a location (default: selection).
 */
export const getBlockAbove = <T extends TAncestor = TAncestor>(
  editor: Editor,
  options: EditorAboveOptions<T> = {}
) =>
  getAbove<T>(editor, {
    ...options,
    block: true,
  });
