import { getToggleMarkOnKeyDown } from '@udecode/slate-plugins-common';
import { getRenderLeaf, SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_ITALIC } from './defaults';
import { getItalicDeserialize } from './getItalicDeserialize';

/**
 * Enables support for italic formatting.
 */
export const createItalicPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_ITALIC,
  renderLeaf: getRenderLeaf(MARK_ITALIC),
  deserialize: getItalicDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_ITALIC),
});
