import {
  getPluginOnKeyDownMark,
  getPluginRenderLeaf,
} from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_HIGHLIGHT } from './defaults';
import { useDeserializeHighlight } from './useDeserializeHighlight';

/**
 * Enables support for highlights, useful when reviewing
 * content or highlighting it for future reference.
 */
export const HighlightPlugin = (): SlatePlugin => ({
  renderLeaf: getPluginRenderLeaf(MARK_HIGHLIGHT),
  deserialize: useDeserializeHighlight(),
  onKeyDown: getPluginOnKeyDownMark(MARK_HIGHLIGHT),
});
