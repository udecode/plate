import { SlatePlugin } from 'common/types';
import { RenderElementOptions } from 'element';
import { deserializeBlockquote } from './deserializeBlockquote';
import { renderElementBlockquote } from './renderElementBlockquote';

export const BlockquotePlugin = (
  options?: RenderElementOptions & { typeBlockquote?: string }
): SlatePlugin => ({
  renderElement: renderElementBlockquote(options),
  deserialize: deserializeBlockquote(options),
});
