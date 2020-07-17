import { SlatePlugin } from '@udecode/slate-plugins-core';
import { onKeyDownMarkDefault } from '../../../common/utils/onKeyDownMarkDefault';
import { DEFAULTS_SUBSUPSCRIPT } from '../defaults';
import { deserializeSuperscript } from './deserializeSuperscript';
import { renderLeafSuperscript } from './renderLeafSuperscript';
import { SuperscriptPluginOptions } from './types';

/**
 * Enables support for superscript formatting.
 */
export const SuperscriptPlugin = (
  options?: SuperscriptPluginOptions
): SlatePlugin => ({
  renderLeaf: renderLeafSuperscript(options),
  deserialize: deserializeSuperscript(options),
  onKeyDown: onKeyDownMarkDefault({
    key: 'superscript',
    defaultOptions: DEFAULTS_SUBSUPSCRIPT,
    options,
  }),
});
