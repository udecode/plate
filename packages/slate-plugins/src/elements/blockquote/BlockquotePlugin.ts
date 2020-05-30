import { SlatePlugin } from '../../common';
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
});
