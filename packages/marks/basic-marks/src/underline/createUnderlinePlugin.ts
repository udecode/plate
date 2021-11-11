import { getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { MARK_UNDERLINE } from './defaults';
import { getUnderlineDeserialize } from './getUnderlineDeserialize';

/**
 * Enables support for underline formatting.
 */
export const createUnderlinePlugin = (): PlatePlugin => ({
  key: MARK_UNDERLINE,
  isLeaf: true,
  deserialize: getUnderlineDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_UNDERLINE),
});
