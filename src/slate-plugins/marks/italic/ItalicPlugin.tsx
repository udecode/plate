import { SlatePlugin } from 'slate-react';
import { onKeyDownMark } from '../onKeyDownMark';
import { renderLeafItalic } from './renderLeafItalic';
import { ItalicPluginOptions, MARK_ITALIC } from './types';

export const ItalicPlugin = ({
  hotkey = 'mod+i',
}: ItalicPluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafItalic(),
  onKeyDown: onKeyDownMark({ mark: MARK_ITALIC, hotkey }),
});
