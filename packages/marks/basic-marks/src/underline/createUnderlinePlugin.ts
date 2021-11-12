import {
  getToggleMarkOnKeyDown,
  ToggleMarkPlugin,
} from '@udecode/plate-common';
import { createPlugin } from '@udecode/plate-core';
import { getUnderlineDeserialize } from './getUnderlineDeserialize';

export const MARK_UNDERLINE = 'underline';

/**
 * Enables support for underline formatting.
 */
export const createUnderlinePlugin = createPlugin<ToggleMarkPlugin>({
  key: MARK_UNDERLINE,
  isLeaf: true,
  deserialize: getUnderlineDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(),
  hotkey: 'mod+u',
});
