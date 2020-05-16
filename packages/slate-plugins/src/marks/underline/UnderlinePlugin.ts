import { SlatePlugin } from 'common/types';
import { onKeyDownMark } from 'mark';
import { deserializeUnderline } from 'marks/underline/deserializeUnderline';
import { renderLeafUnderline } from './renderLeafUnderline';
import { MARK_UNDERLINE, UnderlinePluginOptions } from './types';

export const UnderlinePlugin = ({
  typeUnderline = MARK_UNDERLINE,
  hotkey = 'mod+u',
}: UnderlinePluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafUnderline({ typeUnderline }),
  onKeyDown: onKeyDownMark({ type: typeUnderline, hotkey }),
  deserialize: deserializeUnderline({ typeUnderline }),
});
