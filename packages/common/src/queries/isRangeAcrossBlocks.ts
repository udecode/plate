import { TEditor } from '@udecode/plate-core';
import { Path, Range } from 'slate';
import { EditorAboveOptions } from '../types/Editor.types';
import { getBlockAbove } from './getBlockAbove';

/**
 * Is the range (default: selection) across blocks.
 */
export const isRangeAcrossBlocks = (
  editor: TEditor,
  {
    at,
    ...options
  }: Omit<EditorAboveOptions, 'at' | 'match'> & { at?: Range | null } = {}
) => {
  if (!at) at = editor.selection;
  if (!at) return false;

  const [start, end] = Range.edges(at);
  const startBlock = getBlockAbove(editor, {
    at: start,
    ...options,
  });
  const endBlock = getBlockAbove(editor, {
    at: end,
    ...options,
  });

  return startBlock && endBlock && !Path.equals(startBlock[1], endBlock[1]);
};
