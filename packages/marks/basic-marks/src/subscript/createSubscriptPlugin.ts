import { getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { getRenderLeaf, PlatePlugin } from '@udecode/plate-core';
import { MARK_SUBSCRIPT } from './defaults';
import { getSubscriptDeserialize } from './getSubscriptDeserialize';

/**
 * Enables support for subscript formatting.
 */
export const createSubscriptPlugin = (): PlatePlugin => ({
  pluginKeys: MARK_SUBSCRIPT,
  renderLeaf: getRenderLeaf(MARK_SUBSCRIPT),
  deserialize: getSubscriptDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_SUBSCRIPT),
});
