import { getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { MARK_SUPERSCRIPT } from './defaults';
import { getSuperscriptDeserialize } from './getSuperscriptDeserialize';

/**
 * Enables support for superscript formatting.
 */
export const createSuperscriptPlugin = (): PlatePlugin => ({
  key: MARK_SUPERSCRIPT,
  isLeaf: true,
  deserialize: getSuperscriptDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_SUPERSCRIPT),
});
