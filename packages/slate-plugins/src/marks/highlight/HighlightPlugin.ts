import { getOnHotkeyToggleMarkDefault } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { DEFAULTS_HIGHLIGHT } from './defaults';
import { deserializeHighlight } from './deserializeHighlight';
import { renderLeafHighlight } from './renderLeafHighlight';
import { HighlightPluginOptions } from './types';

/**
 * Enables support for highlights, useful when reviewing
 * content or highlighting it for future reference.
 */
export const HighlightPlugin = (
  options?: HighlightPluginOptions
): SlatePlugin => ({
  renderLeaf: renderLeafHighlight(options),
  deserialize: deserializeHighlight(options),
  onKeyDown: getOnHotkeyToggleMarkDefault({
    key: 'highlight',
    defaultOptions: DEFAULTS_HIGHLIGHT,
    options,
  }),
});
