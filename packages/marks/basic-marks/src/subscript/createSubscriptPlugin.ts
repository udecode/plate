import { getToggleMarkOnKeyDown } from '@udecode/slate-plugins-common';
import { getRenderLeaf, SlatePlugin } from '@udecode/slate-plugins-core';
import { getUnderlineDeserialize } from '../underline/getUnderlineDeserialize';
import { MARK_SUBSCRIPT } from './defaults';

/**
 * Enables support for subscript formatting.
 */
export const createSubscriptPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_SUBSCRIPT,
  renderLeaf: getRenderLeaf(MARK_SUBSCRIPT),
  deserialize: getUnderlineDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_SUBSCRIPT),
});
