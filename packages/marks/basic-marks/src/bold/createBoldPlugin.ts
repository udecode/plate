import { getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { getRenderLeaf, PlatePlugin } from '@udecode/plate-core';
import { MARK_BOLD } from './defaults';
import { getBoldDeserialize } from './getBoldDeserialize';

/**
 * Enables support for bold formatting
 */
export const createBoldPlugin = (): PlatePlugin => ({
  pluginKeys: MARK_BOLD,
  renderLeaf: getRenderLeaf(MARK_BOLD),
  deserialize: getBoldDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_BOLD),
});
