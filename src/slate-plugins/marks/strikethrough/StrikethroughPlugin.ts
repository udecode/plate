import { SlatePlugin } from 'slate-react';
import { onKeyDownMark } from '../onKeyDownMark';
import { deserializeStrikethrough } from './deserializeStrikethrough';
import { renderLeafStrikethrough } from './renderLeafStrikethrough';
import { MARK_STRIKETHROUGH, StrikethroughPluginOptions } from './types';

export const StrikethroughPlugin = ({
  hotkey = 'mod+shift+k',
}: StrikethroughPluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafStrikethrough(),
  onKeyDown: onKeyDownMark({ mark: MARK_STRIKETHROUGH, hotkey }),
  deserialize: deserializeStrikethrough(),
});
