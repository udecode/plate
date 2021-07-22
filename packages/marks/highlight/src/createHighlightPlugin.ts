import { getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { getRenderLeaf, PlatePlugin } from '@udecode/plate-core';
import { MARK_HIGHLIGHT } from './defaults';
import { getHighlightDeserialize } from './getHighlightDeserialize';

/**
 * Enables support for highlights, useful when reviewing
 * content or highlighting it for future reference.
 */
export const createHighlightPlugin = (): PlatePlugin => ({
  pluginKeys: MARK_HIGHLIGHT,
  renderLeaf: getRenderLeaf(MARK_HIGHLIGHT),
  deserialize: getHighlightDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_HIGHLIGHT),
});
