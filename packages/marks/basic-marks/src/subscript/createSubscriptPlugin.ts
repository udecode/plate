import { onKeyDownToggleMark, ToggleMarkPlugin } from '@udecode/plate-common';
import { createPluginFactory } from '@udecode/plate-core';
import { getSubscriptDeserialize } from './getSubscriptDeserialize';

export const MARK_SUBSCRIPT = 'subscript';

/**
 * Enables support for subscript formatting.
 */
export const createSubscriptPlugin = createPluginFactory<ToggleMarkPlugin>({
  key: MARK_SUBSCRIPT,
  isLeaf: true,
  deserialize: getSubscriptDeserialize(),
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+.',
    clear: MARK_SUBSCRIPT,
  },
});
