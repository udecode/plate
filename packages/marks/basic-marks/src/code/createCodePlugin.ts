import { getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { MARK_CODE } from './defaults';
import { getCodeDeserialize } from './getCodeDeserialize';

/**
 * Enables support for code formatting
 */
export const createCodePlugin = (): PlatePlugin => ({
  key: MARK_CODE,
  isLeaf: true,
  deserialize: getCodeDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_CODE),
});
