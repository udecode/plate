import { getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { MARK_BOLD } from './defaults';
import { getBoldDeserialize } from './getBoldDeserialize';

/**
 * Enables support for bold formatting
 */
export const createBoldPlugin = (): PlatePlugin => ({
  key: MARK_BOLD,
  isLeaf: true,
  deserialize: getBoldDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_BOLD),
});
