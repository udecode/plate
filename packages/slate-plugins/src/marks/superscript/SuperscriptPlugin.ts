import { SlatePlugin } from '@udecode/slate-plugins-core';
import { onKeyDownMark } from '../../common/utils/onKeyDownMark';
import { MARK_SUBSCRIPT } from '../subscript/types';
import { deserializeSuperscript } from './deserializeSuperscript';
import { renderLeafSuperscript } from './renderLeafSuperscript';
import { MARK_SUPERSCRIPT, SuperscriptPluginOptions } from './types';

/**
 * Enables support for superscript formatting.
 */
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
