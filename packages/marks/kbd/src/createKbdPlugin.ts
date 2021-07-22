import { getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { getRenderLeaf, PlatePlugin } from '@udecode/plate-core';
import { MARK_KBD } from './defaults';
import { getKbdDeserialize } from './getKbdDeserialize';

/**
 * Enables support for code formatting
 */
export const createKbdPlugin = (): PlatePlugin => ({
  pluginKeys: MARK_KBD,
  renderLeaf: getRenderLeaf(MARK_KBD),
  deserialize: getKbdDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_KBD),
});
