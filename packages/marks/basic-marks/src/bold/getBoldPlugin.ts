import { getToggleMarkOnKeyDown } from '@udecode/slate-plugins-common';
import { getRenderLeaf, SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_BOLD } from './defaults';
import { getBoldDeserialize } from './getBoldDeserialize';

/**
 * Enables support for bold formatting
 */
export const getBoldPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_BOLD,
  renderLeaf: getRenderLeaf(MARK_BOLD),
  deserialize: getBoldDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_BOLD),
});
