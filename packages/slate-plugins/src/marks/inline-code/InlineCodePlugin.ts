import { SlatePlugin } from 'common/types';
import { onKeyDownMark } from 'mark';
import { deserializeInlineCode } from './deserializeInlineCode';
import { renderLeafInlineCode } from './renderLeafInlineCode';
import { InlineCodePluginOptions, MARK_CODE } from './types';

export const InlineCodePlugin = (
  options: InlineCodePluginOptions = {}
): SlatePlugin => ({
  renderLeaf: renderLeafInlineCode(options),
  deserialize: deserializeInlineCode(options),
  onKeyDown: onKeyDownMark(
    options.typeInlineCode ?? MARK_CODE,
    options.hotkey ?? 'mod+`'
  ),
});
