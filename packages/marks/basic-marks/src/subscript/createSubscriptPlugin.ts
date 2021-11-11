import { getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { MARK_SUBSCRIPT } from './defaults';
import { getSubscriptDeserialize } from './getSubscriptDeserialize';

/**
 * Enables support for subscript formatting.
 */
export const createSubscriptPlugin = (): PlatePlugin => ({
  key: MARK_SUBSCRIPT,
  isLeaf: true,
  deserialize: getSubscriptDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_SUBSCRIPT),
});
