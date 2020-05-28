import { SlatePlugin } from 'common/types';
import { BlockquotePluginOptions } from 'elements/blockquote/types';
import { deserializeBlockquote } from './deserializeBlockquote';
import { renderElementBlockquote } from './renderElementBlockquote';

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
