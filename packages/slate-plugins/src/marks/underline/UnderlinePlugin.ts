import { SlatePlugin } from '@udecode/slate-plugins-core';
import { onKeyDownMarkDefault } from '../../common/utils/onKeyDownMarkDefault';
import { DEFAULTS_UNDERLINE } from './defaults';
import { deserializeUnderline } from './deserializeUnderline';
import { renderLeafUnderline } from './renderLeafUnderline';
import { UnderlinePluginOptions } from './types';

/**
 * Enables support for underline formatting.
 */
export const UnderlinePlugin = (
  options?: UnderlinePluginOptions
): SlatePlugin => ({
  renderLeaf: renderLeafUnderline(options),
  deserialize: deserializeUnderline(options),
  onKeyDown: onKeyDownMarkDefault({
    key: 'underline',
    defaultOptions: DEFAULTS_UNDERLINE,
    options,
  }),
});
