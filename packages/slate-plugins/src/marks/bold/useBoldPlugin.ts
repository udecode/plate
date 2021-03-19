import { useOnKeyDownMark, useRenderLeaf } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_BOLD } from './defaults';
import { useDeserializeBold } from './useDeserializeBold';

/**
 * Enables support for bold formatting
 */
export const useBoldPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_BOLD,
  renderLeaf: useRenderLeaf(MARK_BOLD),
  deserialize: useDeserializeBold(),
  onKeyDown: useOnKeyDownMark(MARK_BOLD),
});
