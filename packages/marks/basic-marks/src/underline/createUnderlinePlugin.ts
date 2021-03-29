import { getToggleMarkOnKeyDown } from '@udecode/slate-plugins-common';
import { getRenderLeaf, SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_UNDERLINE } from './defaults';
import { getUnderlineDeserialize } from './getUnderlineDeserialize';

/**
 * Enables support for underline formatting.
 */
export const createUnderlinePlugin = (): SlatePlugin => ({
  pluginKeys: MARK_UNDERLINE,
  renderLeaf: getRenderLeaf(MARK_UNDERLINE),
  deserialize: getUnderlineDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_UNDERLINE),
});
