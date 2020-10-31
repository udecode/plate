import { SlatePlugin } from '@udecode/slate-plugins-core';
import { getOnHotkeyToggleNodeTypeDefault } from '../../common/utils/getOnHotkeyToggleNodeTypeDefault';
import { DEFAULTS_BLOCKQUOTE } from './defaults';
import { deserializeBlockquote } from './deserializeBlockquote';
import { renderElementBlockquote } from './renderElementBlockquote';
import { BlockquotePluginOptions } from './types';

/**
 * Enables support for block quotes, useful for
 * quotations and passages.
 */
export const BlockquotePlugin = (
  options?: BlockquotePluginOptions
): SlatePlugin => ({
  renderElement: renderElementBlockquote(options),
  deserialize: deserializeBlockquote(options),
  onKeyDown: getOnHotkeyToggleNodeTypeDefault({
    key: 'blockquote',
    defaultOptions: DEFAULTS_BLOCKQUOTE,
    options,
  }),
});
