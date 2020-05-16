import { SlatePlugin } from 'common/types';
import { onKeyDownMark } from 'mark';
import { MARK_SUPERSCRIPT } from 'marks/superscript';
import { deserializeSubscript } from './deserializeSubscript';
import { renderLeafSubscript } from './renderLeafSubscript';
import { MARK_SUBSCRIPT, SubscriptPluginOptions } from './types';

export const SubscriptPlugin = ({
  typeSuperscript = MARK_SUPERSCRIPT,
  typeSubscript = MARK_SUBSCRIPT,
  hotkey = 'mod+,',
}: SubscriptPluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafSubscript({ typeSubscript }),
  onKeyDown: onKeyDownMark({
    type: typeSubscript,
    clear: typeSuperscript,
    hotkey,
  }),
  deserialize: deserializeSubscript({ typeSubscript }),
});
