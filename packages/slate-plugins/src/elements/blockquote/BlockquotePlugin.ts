import { SlatePlugin } from 'types';
import { RenderElementOptions } from '../types';
import { deserializeBlockquote } from './deserializeBlockquote';
import { renderElementBlockquote } from './renderElementBlockquote';

export const BlockquotePlugin = (
  options?: RenderElementOptions & { typeBlockquote?: string }
): SlatePlugin => ({
  renderElement: renderElementBlockquote(options),
  deserialize: deserializeBlockquote(options),
});
