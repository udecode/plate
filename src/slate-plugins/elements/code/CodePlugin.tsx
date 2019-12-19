import { SlatePlugin } from 'slate-react';
import { renderElementCode } from './renderElementCode';

export const CodePlugin = (): SlatePlugin => ({
  renderElement: renderElementCode(),
});
