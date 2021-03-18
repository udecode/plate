import {
  getPluginOnKeyDownMark,
  getPluginRenderLeaf,
} from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_BOLD } from './defaults';
import { useDeserializeBold } from './useDeserializeBold';

/**
 * Enables support for bold formatting
 */
export const BoldPlugin = (): SlatePlugin => ({
  renderLeaf: getPluginRenderLeaf(MARK_BOLD),
  deserialize: useDeserializeBold(),
  onKeyDown: getPluginOnKeyDownMark(MARK_BOLD),
});
