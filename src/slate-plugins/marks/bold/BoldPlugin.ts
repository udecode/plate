import { SlatePlugin } from 'slate-react';
import { onKeyDownMark } from '../onKeyDownMark';
import { deserializeBold } from './deserializeBold';
import { renderLeafBold } from './renderLeafBold';
import { BoldPluginOptions, MARK_BOLD } from './types';

export const BoldPlugin = ({
  hotkey = 'mod+b',
}: BoldPluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafBold(),
  onKeyDown: onKeyDownMark({ mark: MARK_BOLD, hotkey }),
  deserialize: deserializeBold(),
});
