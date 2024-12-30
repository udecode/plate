import {
  type GetAboveNodeOptions,
  type TEditor,
  type ValueOf,
  getStartPoint,
} from '../interfaces';
import { getBlockAbove } from './getBlockAbove';
import { getPointFromLocation } from './getPointFromLocation';

/**
 * Get the range from the start of the block above a location (default:
 * selection) to the location.
 */
export const getRangeFromBlockStart = <E extends TEditor>(
  editor: E,
  options: Omit<GetAboveNodeOptions<ValueOf<E>>, 'match'> = {}
) => {
  const path = getBlockAbove(editor, options)?.[1];

  if (!path) return;

  const start = getStartPoint(editor, path)!;

  const focus = getPointFromLocation(editor, options);

  if (!focus) return;

  return { anchor: start, focus };
};
