import { getToggleMarkOnKeyDown } from '@udecode/slate-plugins-common';
import { getRenderLeaf, SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_KBD } from './defaults';
import { getKbdDeserialize } from './getKbdDeserialize';

/**
 * Enables support for code formatting
 */
export const createKbdPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_KBD,
  renderLeaf: getRenderLeaf(MARK_KBD),
  deserialize: getKbdDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_KBD),
});
