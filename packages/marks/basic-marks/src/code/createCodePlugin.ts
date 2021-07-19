import { getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { getRenderLeaf, PlatePlugin } from '@udecode/plate-core';
import { MARK_CODE } from './defaults';
import { getCodeDeserialize } from './getCodeDeserialize';

/**
 * Enables support for code formatting
 */
export const createCodePlugin = (): PlatePlugin => ({
  pluginKeys: MARK_CODE,
  renderLeaf: getRenderLeaf(MARK_CODE),
  deserialize: getCodeDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_CODE),
});
