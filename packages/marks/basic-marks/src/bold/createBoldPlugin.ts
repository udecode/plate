import {
  getToggleMarkOnKeyDown,
  ToggleMarkPlugin,
} from '@udecode/plate-common';
import { createPlugin } from '@udecode/plate-core';
import { getBoldDeserialize } from './getBoldDeserialize';

export const MARK_BOLD = 'bold';

/**
 * Enables support for bold formatting
 */
export const createBoldPlugin = createPlugin<ToggleMarkPlugin>({
  key: MARK_BOLD,
  isLeaf: true,
  deserialize: getBoldDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(),
  hotkey: 'mod+b',
});
