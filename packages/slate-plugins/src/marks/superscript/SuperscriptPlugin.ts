import { SlatePlugin } from 'common/types';
import { onKeyDownMark } from 'mark';
import { MARK_SUBSCRIPT } from 'marks/subscript/types';
import { deserializeSuperscript } from 'marks/superscript/deserializeSuperscript';
import { renderLeafSuperscript } from 'marks/superscript/renderLeafSuperscript';
import {
  MARK_SUPERSCRIPT,
  SuperscriptPluginOptions,
} from 'marks/superscript/types';

export const SuperscriptPlugin = ({
  typeSuperscript = MARK_SUPERSCRIPT,
  typeSubscript = MARK_SUBSCRIPT,
  hotkey = 'mod+.',
}: SuperscriptPluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafSuperscript({ typeSuperscript }),
  onKeyDown: onKeyDownMark({
    type: typeSuperscript,
    clear: typeSubscript,
    hotkey,
  }),
  deserialize: deserializeSuperscript({ typeSuperscript }),
});
