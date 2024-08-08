import type { Location, Range } from 'slate';

import { type TEditor, getPoint } from '@udecode/slate';

import {
  type PointBeforeOptions,
  getPointBeforeLocation,
} from './getPointBeforeLocation';

export interface RangeBeforeOptions extends PointBeforeOptions {}

/** Get range from {@link getPointBeforeLocation} to the end point of `at`. */
export const getRangeBefore = (
  editor: TEditor,
  at: Location,
  options?: RangeBeforeOptions
): Range | undefined => {
  const anchor = getPointBeforeLocation(editor, at, options);

  if (!anchor) return;

  const focus = getPoint(editor, at, { edge: 'end' });

  return {
    anchor,
    focus,
  };
};
