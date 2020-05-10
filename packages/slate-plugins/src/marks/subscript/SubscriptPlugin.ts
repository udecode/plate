import { SlatePlugin } from 'common/types';
import { onKeyDownMark } from 'mark';
import { MARK_SUPERSCRIPT } from 'marks/superscript';
import { deserializeSubscript } from './deserializeSubscript';
import { renderLeafSubscript } from './renderLeafSubscript';
import { MARK_SUBSCRIPT, SubscriptPluginOptions } from './types';

export const SubscriptPlugin = ({
  hotkey = 'mod+,',
}: SubscriptPluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafSubscript(),
  onKeyDown: onKeyDownMark({
    mark: MARK_SUBSCRIPT,
    clear: MARK_SUPERSCRIPT,
    hotkey,
  }),
  deserialize: deserializeSubscript(),
});
