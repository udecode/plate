import { onKeyDownToggleMark, ToggleMarkPlugin } from '@udecode/plate-common';
import { createPluginFactory } from '@udecode/plate-core';
import { getCodeDeserialize } from './getCodeDeserialize';

export const MARK_CODE = 'code';

/**
 * Enables support for code formatting
 */
export const createCodePlugin = createPluginFactory<ToggleMarkPlugin>({
  key: MARK_CODE,
  isLeaf: true,
  deserialize: getCodeDeserialize(),
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+e',
  },
});
