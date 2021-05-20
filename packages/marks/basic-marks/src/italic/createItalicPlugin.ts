import { getToggleMarkOnKeyDown } from '@udecode/slate-plugins-common';
import { getRenderLeaf, SlatePlugin } from '@udecode/slate-plugins-core';
import { getItalicDeserialize } from './getItalicDeserialize';
import { MARK_ITALIC } from './defaults';

/**
 * Enables support for italic formatting.
 */
export const createItalicPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_ITALIC,
  renderLeaf: getRenderLeaf(MARK_ITALIC),
  deserialize: getItalicDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_ITALIC),
});
