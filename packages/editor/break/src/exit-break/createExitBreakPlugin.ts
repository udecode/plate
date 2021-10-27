import { PlatePlugin } from '@udecode/plate-core';
import { getExitBreakOnKeyDown } from './getExitBreakOnKeyDown';
import { ExitBreakPluginOptions } from './types';

/**
 * Insert soft break following configurable rules.
 * Each rule specifies a hotkey and query options.
 */
export const createExitBreakPlugin = (
  options: ExitBreakPluginOptions = {}
): PlatePlugin => ({
  onKeyDown: getExitBreakOnKeyDown(options),
});
