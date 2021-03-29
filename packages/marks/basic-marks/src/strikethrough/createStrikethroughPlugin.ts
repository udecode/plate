import { getToggleMarkOnKeyDown } from '@udecode/slate-plugins-common';
import { getRenderLeaf, SlatePlugin } from '@udecode/slate-plugins-core';
import { getUnderlineDeserialize } from '../underline/getUnderlineDeserialize';
import { MARK_STRIKETHROUGH } from './defaults';

/**
 * Enables support for strikethrough formatting.
 */
export const createStrikethroughPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_STRIKETHROUGH,
  renderLeaf: getRenderLeaf(MARK_STRIKETHROUGH),
  deserialize: getUnderlineDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_STRIKETHROUGH),
});
