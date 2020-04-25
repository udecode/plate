import { SlatePlugin } from 'types';
import { onKeyDownMark } from '../onKeyDownMark';
import { MARK_SUPERSCRIPT } from '../superscript/types';
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
