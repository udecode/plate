import { SlatePlugin } from 'common/types';
import { onKeyDownMark } from 'mark';
import { deserializeInlineCode } from './deserializeInlineCode';
import { renderLeafInlineCode } from './renderLeafInlineCode';
import { InlineCodePluginOptions, MARK_CODE } from './types';

export const InlineCodePlugin = ({
  typeInlineCode = MARK_CODE,
  hotkey = 'mod+`',
}: InlineCodePluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafInlineCode({ typeInlineCode }),
  onKeyDown: onKeyDownMark({ type: MARK_CODE, hotkey }),
  deserialize: deserializeInlineCode({ typeInlineCode }),
});
