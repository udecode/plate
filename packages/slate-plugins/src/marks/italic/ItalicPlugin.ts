import { SlatePlugin } from 'types';
import { onKeyDownMark } from '../onKeyDownMark';
import { deserializeItalic } from './deserializeItalic';
import { renderLeafItalic } from './renderLeafItalic';
import { ItalicPluginOptions, MARK_ITALIC } from './types';

export const ItalicPlugin = ({
  hotkey = 'mod+i',
}: ItalicPluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafItalic(),
  onKeyDown: onKeyDownMark({ mark: MARK_ITALIC, hotkey }),
  deserialize: deserializeItalic(),
});
