import { SlatePlugin } from 'types';
import { onKeyDownMark } from '../onKeyDownMark';
import { MARK_SUBSCRIPT } from '../subscript/types';
import { deserializeSuperscript } from './deserializeSuperscript';
import { renderLeafSuperscript } from './renderLeafSuperscript';
import { MARK_SUPERSCRIPT, SuperscriptPluginOptions } from './types';

export const SuperscriptPlugin = ({
  hotkey = 'mod+.',
}: SuperscriptPluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafSuperscript(),
  onKeyDown: onKeyDownMark({
    mark: MARK_SUPERSCRIPT,
    clear: MARK_SUBSCRIPT,
    hotkey,
  }),
  deserialize: deserializeSuperscript(),
});
