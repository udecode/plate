import { SlatePlugin } from '../../common';
import { onKeyDownMark } from '../../mark';
import { deserializeStrikethrough } from './deserializeStrikethrough';
import { renderLeafStrikethrough } from './renderLeafStrikethrough';
import { MARK_STRIKETHROUGH, StrikethroughPluginOptions } from './types';

/**
 * Enables support for strikethrough formatting.
 */
export const StrikethroughPlugin = (
  options: StrikethroughPluginOptions = {}
): SlatePlugin => ({
  renderLeaf: renderLeafStrikethrough(options),
  onKeyDown: onKeyDownMark(
    options.typeStrikethrough ?? MARK_STRIKETHROUGH,
    options.hotkey ?? 'mod+shift+k'
  ),
  deserialize: deserializeStrikethrough(options),
});
