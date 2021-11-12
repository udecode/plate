import { createPlugin } from '@udecode/plate-core';
import { getSingleLineKeyDown } from './getSingleLineKeyDown';
import { withSingleLine } from './withSingleLine';

export const KEY_SINGLE_LINE = 'singleLine';

/**
 * Forces editor to only have one line.
 */
export const createSingleLinePlugin = createPlugin({
  key: KEY_SINGLE_LINE,
  onKeyDown: getSingleLineKeyDown(),
  withOverrides: withSingleLine(),
});
