import { SlatePlugin } from 'common/types';
import { onKeyDownMark } from 'mark';
import { deserializeItalic } from './deserializeItalic';
import { renderLeafItalic } from './renderLeafItalic';
import { ItalicPluginOptions, MARK_ITALIC } from './types';

export const ItalicPlugin = ({
  typeItalic = MARK_ITALIC,
  hotkey = 'mod+i',
}: ItalicPluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafItalic({ typeItalic }),
  onKeyDown: onKeyDownMark({ type: typeItalic, hotkey }),
  deserialize: deserializeItalic({ typeItalic }),
});
