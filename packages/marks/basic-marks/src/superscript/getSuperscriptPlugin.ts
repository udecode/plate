import { getToggleMarkOnKeyDown } from '@udecode/slate-plugins-common';
import { getRenderLeaf, SlatePlugin } from '@udecode/slate-plugins-core';
import { getUnderlineDeserialize } from '../underline/getUnderlineDeserialize';
import { MARK_SUPERSCRIPT } from './defaults';

/**
 * Enables support for superscript formatting.
 */
export const getSuperscriptPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_SUPERSCRIPT,
  renderLeaf: getRenderLeaf(MARK_SUPERSCRIPT),
  deserialize: getUnderlineDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_SUPERSCRIPT),
});
