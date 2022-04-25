import { Editor } from 'slate';
import { TEditor } from '../../types/slate/TEditor';
import { GetAboveNodeOptions } from '../slate/editor/getAboveNode';
import { getBlockAbove } from './getBlockAbove';
import { getPointFromLocation } from './getPointFromLocation';

/**
 * Get the range from the start of the block above a location (default: selection) to the location.
 */
export const getRangeFromBlockStart = (
  editor: TEditor,
  options: Omit<GetAboveNodeOptions, 'match'> = {}
) => {
  const path = getBlockAbove(editor, options)?.[1];
  if (!path) return;

  const start = Editor.start(editor, path);

  const focus = getPointFromLocation(editor, options);

  if (!focus) return;

  return { anchor: start, focus };
};
