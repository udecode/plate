import {
  getToggleMarkOnKeyDown,
  ToggleMarkPlugin,
} from '@udecode/plate-common';
import { createPluginFactory } from '@udecode/plate-core';
import { getUnderlineDeserialize } from './getUnderlineDeserialize';

export const MARK_UNDERLINE = 'underline';

/**
 * Enables support for underline formatting.
 */
export const createUnderlinePlugin = createPluginFactory<ToggleMarkPlugin>({
  key: MARK_UNDERLINE,
  isLeaf: true,
  deserialize: getUnderlineDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(),
  hotkey: 'mod+u',
});
