import { getToggleMarkOnKeyDown } from '@udecode/slate-plugins-common';
import { getRenderLeaf, SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_SUBSCRIPT } from './defaults';
import { getSubscriptDeserialize } from './getSubscriptDeserialize';

/**
 * Enables support for subscript formatting.
 */
export const createSubscriptPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_SUBSCRIPT,
  renderLeaf: getRenderLeaf(MARK_SUBSCRIPT),
  deserialize: getSubscriptDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_SUBSCRIPT),
});
