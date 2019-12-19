import { SlatePlugin } from 'slate-react';
import { onKeyDownMark } from '../onKeyDownMark';
import { renderLeafInlineCode } from './renderLeafInlineCode';
import { InlineCodePluginOptions, MARK_CODE } from './types';

export const InlineCodePlugin = ({
  hotkey = 'mod+`',
}: InlineCodePluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafInlineCode(),
  onKeyDown: onKeyDownMark({ mark: MARK_CODE, hotkey }),
});
