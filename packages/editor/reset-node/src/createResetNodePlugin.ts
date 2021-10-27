import { PlatePlugin } from '@udecode/plate-core';
import { getResetNodeOnKeyDown } from './getResetNodeOnKeyDown';
import { ResetBlockTypePluginOptions } from './types';

/**
 * Enables support for resetting block type from rules.
 */
export const createResetNodePlugin = (
  options: ResetBlockTypePluginOptions
): PlatePlugin => ({
  onKeyDown: getResetNodeOnKeyDown(options),
});
