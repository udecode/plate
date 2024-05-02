import { Range } from 'slate';

/** See {@link Range.isExpanded}. Return false if `range` is not defined. */
export const isExpanded = (range?: Range | null) =>
  !!range && Range.isExpanded(range);
