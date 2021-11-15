import {
  getToggleMarkOnKeyDown,
  ToggleMarkPlugin,
} from '@udecode/plate-common';
import { createPluginFactory } from '@udecode/plate-core';
import { getSuperscriptDeserialize } from './getSuperscriptDeserialize';

export const MARK_SUPERSCRIPT = 'superscript';

/**
 * Enables support for superscript formatting.
 */
export const createSuperscriptPlugin = createPluginFactory<ToggleMarkPlugin>({
  key: MARK_SUPERSCRIPT,
  isLeaf: true,
  deserialize: getSuperscriptDeserialize(),
  handlers: {
    onKeyDown: getToggleMarkOnKeyDown(),
  },
  options: {
    hotkey: 'mod+,',
    clear: MARK_SUPERSCRIPT,
  },
});
