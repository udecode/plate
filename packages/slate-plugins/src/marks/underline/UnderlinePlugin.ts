import {
  getPluginOnKeyDownMark,
  getPluginRenderLeaf,
} from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_UNDERLINE } from './defaults';
import { useDeserializeUnderline } from './useDeserializeUnderline';

/**
 * Enables support for underline formatting.
 */
export const UnderlinePlugin = (): SlatePlugin => ({
  renderLeaf: getPluginRenderLeaf(MARK_UNDERLINE),
  deserialize: useDeserializeUnderline(),
  onKeyDown: getPluginOnKeyDownMark(MARK_UNDERLINE),
});
