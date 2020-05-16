import { SlatePlugin } from 'common/types';
import { onKeyDownMark } from 'mark';
import { deserializeStrikethrough } from 'marks/strikethrough/deserializeStrikethrough';
import { renderLeafStrikethrough } from './renderLeafStrikethrough';
import { MARK_STRIKETHROUGH, StrikethroughPluginOptions } from './types';

export const StrikethroughPlugin = ({
  typeStrikethrough = MARK_STRIKETHROUGH,
  hotkey = 'mod+shift+k',
}: StrikethroughPluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafStrikethrough({ typeStrikethrough }),
  onKeyDown: onKeyDownMark({ type: typeStrikethrough, hotkey }),
  deserialize: deserializeStrikethrough({ typeStrikethrough }),
});
