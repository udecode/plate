import { getToggleMarkOnKeyDown } from '@udecode/slate-plugins-common';
import { getRenderLeaf, SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_HIGHLIGHT } from './defaults';
import { getHighlightDeserialize } from './getHighlightDeserialize';

/**
 * Enables support for highlights, useful when reviewing
 * content or highlighting it for future reference.
 */
export const getHighlightPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_HIGHLIGHT,
  renderLeaf: getRenderLeaf(MARK_HIGHLIGHT),
  deserialize: getHighlightDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_HIGHLIGHT),
});
