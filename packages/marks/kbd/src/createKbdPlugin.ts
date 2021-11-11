import { getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { MARK_KBD } from './defaults';
import { getKbdDeserialize } from './getKbdDeserialize';

/**
 * Enables support for code formatting
 */
export const createKbdPlugin = (): PlatePlugin => ({
  key: MARK_KBD,
  isLeaf: true,
  deserialize: getKbdDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_KBD),
});
