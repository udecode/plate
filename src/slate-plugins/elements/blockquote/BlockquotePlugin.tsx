import { SlatePlugin } from 'slate-react';
import { renderElementBlockquote } from './renderElementBlockquote';

export const BlockquotePlugin = (): SlatePlugin => ({
  renderElement: renderElementBlockquote(),
});
