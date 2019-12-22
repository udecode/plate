import { SlatePlugin } from 'slate-react';
import { deserializeBlockquote } from './deserializeBlockquote';
import { renderElementBlockquote } from './renderElementBlockquote';

export const BlockquotePlugin = (): SlatePlugin => ({
  renderElement: renderElementBlockquote(),
  deserialize: deserializeBlockquote(),
});
