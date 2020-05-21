import { SlatePlugin } from 'common/types';
import { onKeyDownMark } from 'mark';
import { deserializeUnderline } from 'marks/underline/deserializeUnderline';
import { renderLeafUnderline } from './renderLeafUnderline';
import { MARK_UNDERLINE, UnderlinePluginOptions } from './types';

export const UnderlinePlugin = (
  options: UnderlinePluginOptions = {}
): SlatePlugin => ({
  renderLeaf: renderLeafUnderline(options),
  deserialize: deserializeUnderline(options),
  onKeyDown: onKeyDownMark(
    options.typeUnderline ?? MARK_UNDERLINE,
    options.hotkey ?? 'mod+u'
  ),
});
