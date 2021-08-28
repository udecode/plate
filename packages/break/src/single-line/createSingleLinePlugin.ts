import { PlatePlugin } from '@udecode/plate-core';
import { getSingleLineKeyDown } from './getSingleLineKeyDown';
import { withSingleLine } from './withSingleLine';

/**
 * Forces editor to only have one line.
 */
export const createSingleLinePlugin = (): PlatePlugin => ({
  onKeyDown: getSingleLineKeyDown(),
  withOverrides: withSingleLine(),
});
