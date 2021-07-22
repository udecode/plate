import { getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { getRenderLeaf, PlatePlugin } from '@udecode/plate-core';
import { MARK_STRIKETHROUGH } from './defaults';
import { getStrikethroughDeserialize } from './getStrikethroughDeserialize';

/**
 * Enables support for strikethrough formatting.
 */
export const createStrikethroughPlugin = (): PlatePlugin => ({
  pluginKeys: MARK_STRIKETHROUGH,
  renderLeaf: getRenderLeaf(MARK_STRIKETHROUGH),
  deserialize: getStrikethroughDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_STRIKETHROUGH),
});
