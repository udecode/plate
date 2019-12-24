import { SlatePlugin } from 'slate-plugins/types';
import { deserializeBlockquote } from './deserializeBlockquote';
import { renderElementBlockquote } from './renderElementBlockquote';

export const BlockquotePlugin = (): SlatePlugin => ({
  renderElement: renderElementBlockquote(),
  deserialize: deserializeBlockquote(),
});
