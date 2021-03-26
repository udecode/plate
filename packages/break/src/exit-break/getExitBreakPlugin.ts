import { SlatePlugin } from '@udecode/slate-plugins-core';
import { getExitBreakOnKeyDown } from './getExitBreakOnKeyDown';
import { ExitBreakPluginOptions } from './types';

/**
 * Insert soft break following configurable rules.
 * Each rule specifies a hotkey and query options.
 */
export const getExitBreakPlugin = (
  options: ExitBreakPluginOptions = {}
): SlatePlugin => ({
  onKeyDown: getExitBreakOnKeyDown(options),
});
