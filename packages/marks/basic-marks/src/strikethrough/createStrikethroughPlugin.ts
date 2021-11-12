import {
  getToggleMarkOnKeyDown,
  ToggleMarkPlugin,
} from '@udecode/plate-common';
import { createPlugin } from '@udecode/plate-core';
import { getStrikethroughDeserialize } from './getStrikethroughDeserialize';

export const MARK_STRIKETHROUGH = 'strikethrough';

/**
 * Enables support for strikethrough formatting.
 */
export const createStrikethroughPlugin = createPlugin<ToggleMarkPlugin>({
  key: MARK_STRIKETHROUGH,
  isLeaf: true,
  deserialize: getStrikethroughDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(),
  hotkey: 'mod+shift+s',
});
