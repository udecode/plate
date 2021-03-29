import { SlatePlugin } from '@udecode/slate-plugins-core';
import { getResetNodeOnKeyDown } from './getResetNodeOnKeyDown';
import { ResetBlockTypePluginOptions } from './types';

/**
 * Enables support for resetting block type from rules.
 */
export const createResetNodePlugin = (
  options: ResetBlockTypePluginOptions
): SlatePlugin => ({
  onKeyDown: getResetNodeOnKeyDown(options),
});
