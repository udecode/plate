import { createPluginFactory } from '@udecode/plate-core';
import { getSingleLineKeyDown } from './getSingleLineKeyDown';
import { withSingleLine } from './withSingleLine';

export const KEY_SINGLE_LINE = 'singleLine';

/**
 * Forces editor to only have one line.
 */
export const createSingleLinePlugin = createPluginFactory({
  key: KEY_SINGLE_LINE,
  onKeyDown: getSingleLineKeyDown(),
  withOverrides: withSingleLine(),
});
