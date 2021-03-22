import { SlatePlugin } from '@udecode/slate-plugins-core';
import { onKeyDownExitBreak } from './onKeyDownExitBreak';
import { ExitBreakPluginOptions } from './types';

/**
 * Insert soft break following configurable rules.
 * Each rule specifies a hotkey and query options.
 */
export const useExitBreakPlugin = (
  options: ExitBreakPluginOptions = {}
): SlatePlugin => ({
  onKeyDown: onKeyDownExitBreak(options),
});
