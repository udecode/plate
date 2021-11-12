import { createPlugin } from '@udecode/plate-core';
import { getExitBreakOnKeyDown } from './getExitBreakOnKeyDown';
import { ExitBreakPlugin } from './types';

export const KEY_EXIT_BREAK = 'exitBreak';

/**
 * Insert soft break following configurable rules.
 * Each rule specifies a hotkey and query options.
 */
export const createExitBreakPlugin = createPlugin<ExitBreakPlugin>({
  key: KEY_EXIT_BREAK,
  onKeyDown: getExitBreakOnKeyDown(),
  rules: [{ hotkey: 'mod+enter' }, { hotkey: 'mod+shift+enter', before: true }],
});
