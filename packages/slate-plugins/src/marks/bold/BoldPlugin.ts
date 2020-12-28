import { getOnHotkeyToggleMarkDefault } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
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
  onKeyDown: getOnHotkeyToggleMarkDefault({
    key: 'bold',
    defaultOptions: DEFAULTS_BOLD,
    options,
  }),
});
