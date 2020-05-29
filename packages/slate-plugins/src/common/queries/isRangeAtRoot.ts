import { Range } from 'slate';
import { isPointAtRoot } from './isPointAtRoot';

export const isRangeAtRoot = (range: Range) =>
  isPointAtRoot(range.anchor) || isPointAtRoot(range.focus);
