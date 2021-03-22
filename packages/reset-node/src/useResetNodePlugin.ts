import { SlatePlugin } from '@udecode/slate-plugins-core';
import { onKeyDownResetNode } from './onKeyDownResetNode';
import { ResetBlockTypePluginOptions } from './types';

/**
 * Enables support for resetting block type from rules.
 */
export const useResetNodePlugin = (
  options: ResetBlockTypePluginOptions
): SlatePlugin => ({
  onKeyDown: onKeyDownResetNode(options),
});
