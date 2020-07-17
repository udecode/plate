import { SlatePlugin } from '@udecode/slate-plugins-core';
import { onKeyDownMarkDefault } from '../../common/utils/onKeyDownMarkDefault';
import { DEFAULTS_BOLD } from './defaults';
import { deserializeBold } from './deserializeBold';
import { renderLeafBold } from './renderLeafBold';
import { BoldPluginOptions } from './types';

/**
 * Enables support for bold formatting
 */
export const BoldPlugin = (options?: BoldPluginOptions): SlatePlugin => ({
  renderLeaf: renderLeafBold(options),
  deserialize: deserializeBold(options),
  onKeyDown: onKeyDownMarkDefault({
    key: 'bold',
    defaultOptions: DEFAULTS_BOLD,
    options,
  }),
});
