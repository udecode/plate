import { SlatePlugin } from 'slate-plugins/types';
import { deserializeCode } from './deserializeCode';
import { renderElementCode } from './renderElementCode';

export const CodePlugin = (): SlatePlugin => ({
  renderElement: renderElementCode(),
  deserialize: deserializeCode(),
});
