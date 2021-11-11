import { getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { MARK_STRIKETHROUGH } from './defaults';
import { getStrikethroughDeserialize } from './getStrikethroughDeserialize';

/**
 * Enables support for strikethrough formatting.
 */
export const createStrikethroughPlugin = (): PlatePlugin => ({
  key: MARK_STRIKETHROUGH,
  isLeaf: true,
  deserialize: getStrikethroughDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_STRIKETHROUGH),
});
