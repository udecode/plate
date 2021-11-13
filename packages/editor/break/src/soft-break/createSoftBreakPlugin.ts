import { createPluginFactory } from '@udecode/plate-core';
import { getSoftBreakOnKeyDown } from './getSoftBreakOnKeyDown';
import { SoftBreakPlugin } from './types';

export const KEY_SOFT_BREAK = 'softBreak';

/**
 * Insert soft break following configurable rules.
 * Each rule specifies a hotkey and query options.
 */
export const createSoftBreakPlugin = createPluginFactory<SoftBreakPlugin>({
  key: KEY_SOFT_BREAK,
  onKeyDown: getSoftBreakOnKeyDown(),
  rules: [{ hotkey: 'shift+enter' }],
});
