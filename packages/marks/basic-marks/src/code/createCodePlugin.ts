import { getToggleMarkOnKeyDown } from '@udecode/slate-plugins-common';
import { getRenderLeaf, SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_CODE } from './defaults';
import { getCodeDeserialize } from './getCodeDeserialize';

/**
 * Enables support for code formatting
 */
export const createCodePlugin = (): SlatePlugin => ({
  pluginKeys: MARK_CODE,
  renderLeaf: getRenderLeaf(MARK_CODE),
  deserialize: getCodeDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_CODE),
});
