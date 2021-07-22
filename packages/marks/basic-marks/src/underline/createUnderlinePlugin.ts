import { getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { getRenderLeaf, PlatePlugin } from '@udecode/plate-core';
import { MARK_UNDERLINE } from './defaults';
import { getUnderlineDeserialize } from './getUnderlineDeserialize';

/**
 * Enables support for underline formatting.
 */
export const createUnderlinePlugin = (): PlatePlugin => ({
  pluginKeys: MARK_UNDERLINE,
  renderLeaf: getRenderLeaf(MARK_UNDERLINE),
  deserialize: getUnderlineDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_UNDERLINE),
});
