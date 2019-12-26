import { SlatePlugin } from 'types';
import { onKeyDownMark } from '../onKeyDownMark';
import { deserializeUnderline } from './deserializeUnderline';
import { renderLeafUnderline } from './renderLeafUnderline';
import { MARK_UNDERLINE, UnderlinePluginOptions } from './types';

export const UnderlinePlugin = ({
  hotkey = 'mod+u',
}: UnderlinePluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafUnderline(),
  onKeyDown: onKeyDownMark({ mark: MARK_UNDERLINE, hotkey }),
  deserialize: deserializeUnderline(),
});
