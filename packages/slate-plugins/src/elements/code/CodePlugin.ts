import { SlatePlugin } from 'types';
import { RenderElementOptions } from '../types';
import { deserializeCode } from './deserializeCode';
import { renderElementCode } from './renderElementCode';

export const CodePlugin = (options?: RenderElementOptions): SlatePlugin => ({
  renderElement: renderElementCode(options),
  deserialize: deserializeCode(),
});
