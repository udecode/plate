import { createPluginFactory } from '@udecode/plate-core';
import { getResetNodeOnKeyDown } from './getResetNodeOnKeyDown';
import { ResetNodePlugin } from './types';

export const KEY_RESET_NODE = 'resetNode';

/**
 * Enables support for resetting block type from rules.
 */
export const createResetNodePlugin = createPluginFactory<ResetNodePlugin>({
  key: KEY_RESET_NODE,
  onKeyDown: getResetNodeOnKeyDown(),
  rules: [],
});
