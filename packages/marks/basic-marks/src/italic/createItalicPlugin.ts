import { getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { MARK_ITALIC } from './defaults';
import { getItalicDeserialize } from './getItalicDeserialize';

/**
 * Enables support for italic formatting.
 */
export const createItalicPlugin = (): PlatePlugin => ({
  key: MARK_ITALIC,
  isLeaf: true,
  deserialize: getItalicDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_ITALIC),
});
