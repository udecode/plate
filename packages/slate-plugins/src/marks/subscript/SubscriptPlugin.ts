import { SlatePlugin } from 'common/types';
import { onKeyDownMark } from 'mark';
import { MARK_SUPERSCRIPT } from 'marks/superscript';
import { deserializeSubscript } from './deserializeSubscript';
import { renderLeafSubscript } from './renderLeafSubscript';
import { MARK_SUBSCRIPT, SubscriptPluginOptions } from './types';

export const SubscriptPlugin = (
  options: SubscriptPluginOptions = {}
): SlatePlugin => ({
  renderLeaf: renderLeafSubscript(options),
  deserialize: deserializeSubscript(options),
  onKeyDown: onKeyDownMark(
    options.typeSubscript ?? MARK_SUBSCRIPT,
    options.hotkey ?? 'mod+,',
    {
      clear: options.typeSuperscript ?? MARK_SUPERSCRIPT,
    }
  ),
});
