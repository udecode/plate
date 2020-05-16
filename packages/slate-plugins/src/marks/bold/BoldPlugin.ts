import { SlatePlugin } from 'common/types';
import { onKeyDownMark } from 'mark';
import { deserializeBold } from './deserializeBold';
import { renderLeafBold } from './renderLeafBold';
import { BoldPluginOptions, MARK_BOLD } from './types';

export const BoldPlugin = ({
  typeBold = MARK_BOLD,
  hotkey = 'mod+b',
}: BoldPluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafBold({ typeBold }),
  onKeyDown: onKeyDownMark({ type: typeBold, hotkey }),
  deserialize: deserializeBold({ typeBold }),
});
