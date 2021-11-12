import {
  getToggleMarkOnKeyDown,
  ToggleMarkPlugin,
} from '@udecode/plate-common';
import { createPlugin } from '@udecode/plate-core';
import { getSuperscriptDeserialize } from './getSuperscriptDeserialize';

export const MARK_SUPERSCRIPT = 'superscript';

/**
 * Enables support for superscript formatting.
 */
export const createSuperscriptPlugin = createPlugin<ToggleMarkPlugin>({
  key: MARK_SUPERSCRIPT,
  isLeaf: true,
  deserialize: getSuperscriptDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(),
  hotkey: 'mod+,',
  clear: MARK_SUPERSCRIPT,
});
