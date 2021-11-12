import {
  getToggleMarkOnKeyDown,
  ToggleMarkPlugin,
} from '@udecode/plate-common';
import { createPlugin } from '@udecode/plate-core';
import { getSubscriptDeserialize } from './getSubscriptDeserialize';

export const MARK_SUBSCRIPT = 'subscript';

/**
 * Enables support for subscript formatting.
 */
export const createSubscriptPlugin = createPlugin<ToggleMarkPlugin>({
  key: MARK_SUBSCRIPT,
  isLeaf: true,
  deserialize: getSubscriptDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(),
  hotkey: 'mod+.',
  clear: MARK_SUBSCRIPT,
});
