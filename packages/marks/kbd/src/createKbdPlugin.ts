import { getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { createPluginFactory } from '@udecode/plate-core';
import { getKbdDeserialize } from './getKbdDeserialize';

export const MARK_KBD = 'kbd';

/**
 * Enables support for code formatting
 */
export const createKbdPlugin = createPluginFactory({
  key: MARK_KBD,
  isLeaf: true,
  deserialize: getKbdDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(),
});
