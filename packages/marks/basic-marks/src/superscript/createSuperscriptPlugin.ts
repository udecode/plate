import { getToggleMarkOnKeyDown } from '@udecode/slate-plugins-common';
import { getRenderLeaf, SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_SUPERSCRIPT } from './defaults';
import { getSuperscriptDeserialize } from './getSuperscriptDeserialize';

/**
 * Enables support for superscript formatting.
 */
export const createSuperscriptPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_SUPERSCRIPT,
  renderLeaf: getRenderLeaf(MARK_SUPERSCRIPT),
  deserialize: getSuperscriptDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_SUPERSCRIPT),
});
