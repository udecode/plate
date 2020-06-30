import { SlatePlugin } from '@udecode/core';
import { onKeyDownExitBreak } from './onKeyDownExitBreak';
import { ExitBreakPluginOptions } from './types';

/**
 * Insert soft break following configurable rules.
 * Each rule specifies a hotkey and query options.
 */
export const ExitBreakPlugin = (
  options: ExitBreakPluginOptions = {}
): SlatePlugin => ({
  onKeyDown: onKeyDownExitBreak(options),
});
