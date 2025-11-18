import { createSlatePlugin, type InsertExitBreakOptions } from '@platejs/core';

import { KEYS } from '../plate-keys';

/**
 * Insert soft break following configurable rules. Each rule specifies a hotkey
 * and query options.
 */
export const ExitBreakPlugin = createSlatePlugin({
  key: KEYS.exitBreak,
  editOnly: true,
}).extendTransforms(({ editor }) => ({
  insert: (options: Omit<InsertExitBreakOptions, 'reverse'>) =>
    editor.tf.insertExitBreak(options),
  insertBefore: (options: Omit<InsertExitBreakOptions, 'reverse'>) =>
    editor.tf.insertExitBreak({ ...options, reverse: true }),
}));
