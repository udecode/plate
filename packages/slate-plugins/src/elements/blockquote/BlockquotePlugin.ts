import { SlatePlugin } from '@udecode/slate-plugins-core';
import { onKeyDownTypeDefault } from '../../common/utils/onKeyDownTypeDefault';
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
  onKeyDown: onKeyDownTypeDefault({
    key: 'blockquote',
    defaultOptions: DEFAULTS_BLOCKQUOTE,
    options,
  }),
});
