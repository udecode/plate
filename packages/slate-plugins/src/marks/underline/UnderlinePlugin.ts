import { SlatePlugin } from '../../common';
import { onKeyDownMark } from '../../mark';
import { deserializeUnderline } from './deserializeUnderline';
import { renderLeafUnderline } from './renderLeafUnderline';
import { MARK_UNDERLINE, UnderlinePluginOptions } from './types';

/**
 * Enables support for underline formatting.
 */
export const UnderlinePlugin = (
  options: UnderlinePluginOptions = {}
): SlatePlugin => ({
  renderLeaf: renderLeafUnderline(options),
  deserialize: deserializeUnderline(options),
  onKeyDown: onKeyDownMark(
    options.typeUnderline ?? MARK_UNDERLINE,
    options.hotkey ?? 'mod+u'
  ),
});
