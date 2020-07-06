import { SlatePlugin } from '@udecode/core';
import { onKeyDownMark } from '../../common/utils/onKeyDownMark';
import { deserializeHighlight } from './deserializeHighlight';
import { renderLeafHighlight } from './renderLeafHighlight';
import { HighlightPluginOptions, MARK_HIGHLIGHT } from './types';

/**
 * Enables support for highlights, useful when reviewing
 * content or highlighting it for future reference.
 */
export const HighlightPlugin = (
  options: HighlightPluginOptions = {}
): SlatePlugin => ({
  renderLeaf: renderLeafHighlight(options),
  deserialize: deserializeHighlight(options),
  onKeyDown: onKeyDownMark(
    options.typeHighlight ?? MARK_HIGHLIGHT,
    options.hotkey
  ),
});
