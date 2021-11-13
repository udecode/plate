import {
  getToggleMarkOnKeyDown,
  ToggleMarkPlugin,
} from '@udecode/plate-common';
import { createPluginFactory } from '@udecode/plate-core';
import { getItalicDeserialize } from './getItalicDeserialize';

export const MARK_ITALIC = 'italic';

/**
 * Enables support for italic formatting.
 */
export const createItalicPlugin = createPluginFactory<ToggleMarkPlugin>({
  key: MARK_ITALIC,
  isLeaf: true,
  deserialize: getItalicDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(),
  hotkey: 'mod+i',
});
