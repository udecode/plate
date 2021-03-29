import { SlatePlugin } from '@udecode/slate-plugins-core';
import { getSoftBreakOnKeyDown } from './getSoftBreakOnKeyDown';
import { SoftBreakPluginOptions } from './types';

/**
 * Insert soft break following configurable rules.
 * Each rule specifies a hotkey and query options.
 */
export const createSoftBreakPlugin = (
  options: SoftBreakPluginOptions = {}
): SlatePlugin => ({
  onKeyDown: getSoftBreakOnKeyDown(options),
});
