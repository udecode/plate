import { getToggleMarkOnKeyDown } from '@udecode/slate-plugins-common';
import { getRenderLeaf, SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_STRIKETHROUGH } from './defaults';
import { getStrikethroughDeserialize } from './getStrikethroughDeserialize';

/**
 * Enables support for strikethrough formatting.
 */
export const createStrikethroughPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_STRIKETHROUGH,
  renderLeaf: getRenderLeaf(MARK_STRIKETHROUGH),
  deserialize: getStrikethroughDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_STRIKETHROUGH),
});
