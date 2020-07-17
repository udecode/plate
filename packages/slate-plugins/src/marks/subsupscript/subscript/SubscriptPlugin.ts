import { SlatePlugin } from '@udecode/slate-plugins-core';
import { onKeyDownMarkDefault } from '../../../common/utils/onKeyDownMarkDefault';
import { DEFAULTS_SUBSUPSCRIPT } from '../defaults';
import { deserializeSubscript } from './deserializeSubscript';
import { renderLeafSubscript } from './renderLeafSubscript';
import { SubscriptPluginOptions } from './types';

/**
 * Enables support for subscript formatting.
 */
export const SubscriptPlugin = (
  options?: SubscriptPluginOptions
): SlatePlugin => ({
  renderLeaf: renderLeafSubscript(options),
  deserialize: deserializeSubscript(options),
  onKeyDown: onKeyDownMarkDefault({
    key: 'subscript',
    defaultOptions: DEFAULTS_SUBSUPSCRIPT,
    options,
  }),
});
