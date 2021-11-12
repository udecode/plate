import {
  getToggleMarkOnKeyDown,
  ToggleMarkPlugin,
} from '@udecode/plate-common';
import { createPlugin } from '@udecode/plate-core';
import { getCodeDeserialize } from './getCodeDeserialize';

export const MARK_CODE = 'code';

/**
 * Enables support for code formatting
 */
export const createCodePlugin = createPlugin<ToggleMarkPlugin>({
  key: MARK_CODE,
  isLeaf: true,
  deserialize: getCodeDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(),
  hotkey: 'mod+e',
});
