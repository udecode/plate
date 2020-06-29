import { SlatePlugin } from '@udecode/core';
import { onKeyDownSoftBreak } from './onKeyDownSoftBreak';
import { SoftBreakPluginOptions } from './types';

/**
 * Insert soft break following configurable rules.
 * Each rule specifies a hotkey and query options.
 */
export const SoftBreakPlugin = (
  options: SoftBreakPluginOptions = {}
): SlatePlugin => ({
  onKeyDown: onKeyDownSoftBreak(options),
});
