import { SlatePlugin } from 'common/types';
import { onKeyDownMark } from 'mark';
import { deserializeBold } from './deserializeBold';
import { renderLeafBold } from './renderLeafBold';
import { BoldPluginOptions, MARK_BOLD } from './types';

export const BoldPlugin = (options: BoldPluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafBold(options),
  onKeyDown: onKeyDownMark(
    options.typeBold ?? MARK_BOLD,
    options.hotkey ?? 'mod+b'
  ),
  deserialize: deserializeBold(options),
});
