import { createPluginFactory } from '@udecode/plate-core';
import { onKeyDownResetNode } from './onKeyDownResetNode';
import { ResetNodePlugin } from './types';

export const KEY_RESET_NODE = 'resetNode';

/**
 * Enables support for resetting block type from rules.
 */
export const createResetNodePlugin = createPluginFactory<ResetNodePlugin>({
  key: KEY_RESET_NODE,
  handlers: {
    onKeyDown: onKeyDownResetNode,
  },
  options: {
    rules: [],
  },
});
