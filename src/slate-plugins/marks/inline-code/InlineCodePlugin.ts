import { SlatePlugin } from 'slate-plugins/types';
import { onKeyDownMark } from '../onKeyDownMark';
import { deserializeInlineCode } from './deserializeInlineCode';
import { renderLeafInlineCode } from './renderLeafInlineCode';
import { InlineCodePluginOptions, MARK_CODE } from './types';

export const InlineCodePlugin = ({
  hotkey = 'mod+`',
}: InlineCodePluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafInlineCode(),
  onKeyDown: onKeyDownMark({ mark: MARK_CODE, hotkey }),
  deserialize: deserializeInlineCode(),
});
