import { SlatePlugin } from 'slate-react';
import { deserializeCode } from './deserializeCode';
import { renderElementCode } from './renderElementCode';

export const CodePlugin = (): SlatePlugin => ({
  renderElement: renderElementCode(),
  deserialize: deserializeCode(),
});
