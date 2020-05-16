import { isPointAtRoot } from 'common/queries/isPointAtRoot';
import { Range } from 'slate';

export const isRangeAtRoot = (range: Range) =>
  isPointAtRoot(range.anchor) || isPointAtRoot(range.focus);
