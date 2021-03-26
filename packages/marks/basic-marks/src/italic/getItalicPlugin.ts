import { getToggleMarkOnKeyDown } from '@udecode/slate-plugins-common';
import { getRenderLeaf, SlatePlugin } from '@udecode/slate-plugins-core';
import { getCodeDeserialize } from '../code/getCodeDeserialize';
import { MARK_ITALIC } from './defaults';

/**
 * Enables support for italic formatting.
 */
export const getItalicPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_ITALIC,
  renderLeaf: getRenderLeaf(MARK_ITALIC),
  deserialize: getCodeDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_ITALIC),
});
