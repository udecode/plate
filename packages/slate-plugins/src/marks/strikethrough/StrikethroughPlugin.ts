import { SlatePlugin } from '@udecode/slate-plugins-core';
import { onKeyDownMarkDefault } from '../../common/utils/onKeyDownMarkDefault';
import { DEFAULTS_STRIKETHROUGH } from './defaults';
import { deserializeStrikethrough } from './deserializeStrikethrough';
import { renderLeafStrikethrough } from './renderLeafStrikethrough';
import { StrikethroughPluginOptions } from './types';

/**
 * Enables support for strikethrough formatting.
 */
export const StrikethroughPlugin = (
  options?: StrikethroughPluginOptions
): SlatePlugin => ({
  renderLeaf: renderLeafStrikethrough(options),
  deserialize: deserializeStrikethrough(options),
  onKeyDown: onKeyDownMarkDefault({
    key: 'strikethrough',
    defaultOptions: DEFAULTS_STRIKETHROUGH,
    options,
  }),
});
