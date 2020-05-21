import { SlatePlugin } from 'common/types';
import { onKeyDownMark } from 'mark';
import { MARK_SUBSCRIPT } from 'marks/subscript/types';
import { deserializeSuperscript } from 'marks/superscript/deserializeSuperscript';
import { renderLeafSuperscript } from 'marks/superscript/renderLeafSuperscript';
import {
  MARK_SUPERSCRIPT,
  SuperscriptPluginOptions,
} from 'marks/superscript/types';

export const SuperscriptPlugin = (
  options: SuperscriptPluginOptions = {}
): SlatePlugin => ({
  renderLeaf: renderLeafSuperscript(options),
  deserialize: deserializeSuperscript(options),
  onKeyDown: onKeyDownMark(
    options.typeSuperscript ?? MARK_SUPERSCRIPT,
    options.hotkey ?? 'mod+.',
    {
      clear: options.typeSubscript ?? MARK_SUBSCRIPT,
    }
  ),
});
