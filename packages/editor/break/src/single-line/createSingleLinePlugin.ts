import { createPlugin } from '@udecode/plate-core';
import { KEY_SINGLE_LINE } from './defaults';
import { getSingleLineKeyDown } from './getSingleLineKeyDown';
import { withSingleLine } from './withSingleLine';

/**
 * Forces editor to only have one line.
 */
export const createSingleLinePlugin = createPlugin({
  key: KEY_SINGLE_LINE,
  onKeyDown: getSingleLineKeyDown(),
  withOverrides: withSingleLine(),
});
