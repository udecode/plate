import { SlatePlugin } from '@udecode/slate-plugins-core';
import { onKeyDownResetBlockType } from './onKeyDownResetBlockType';
import { ResetBlockTypePluginOptions } from './types';

/**
 * Enables support for resetting block type from rules.
 */
export const useResetBlockTypePlugin = (
  options: ResetBlockTypePluginOptions
): SlatePlugin => ({
  onKeyDown: onKeyDownResetBlockType(options),
});
