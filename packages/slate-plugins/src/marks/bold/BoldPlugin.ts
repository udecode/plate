/**
 * Enables support for bold formatting
 */
import { SlatePlugin } from '@udecode/core';
import { onKeyDownMark } from '../../mark/onKeyDownMark';
import { deserializeBold } from './deserializeBold';
import { renderLeafBold } from './renderLeafBold';
import { BoldPluginOptions, MARK_BOLD } from './types';

export const BoldPlugin = (options: BoldPluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafBold(options),
  deserialize: deserializeBold(options),
  onKeyDown: onKeyDownMark(
    options.typeBold ?? MARK_BOLD,
    options.hotkey ?? 'mod+b'
  ),
});
