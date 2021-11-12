import { createPlugin } from '@udecode/plate-core';
import { KEY_SOFT_BREAK } from './defaults';
import { getSoftBreakOnKeyDown } from './getSoftBreakOnKeyDown';
import { SoftBreakPlugin } from './types';

/**
 * Insert soft break following configurable rules.
 * Each rule specifies a hotkey and query options.
 */
export const createSoftBreakPlugin = createPlugin<SoftBreakPlugin>({
  key: KEY_SOFT_BREAK,
  onKeyDown: getSoftBreakOnKeyDown(),
  rules: [{ hotkey: 'shift+enter' }],
});
