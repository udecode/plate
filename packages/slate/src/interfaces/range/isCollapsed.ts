import { Range } from 'slate';

export const isCollapsed = (range?: Range | null) =>
  !!range && Range.isCollapsed(range);
