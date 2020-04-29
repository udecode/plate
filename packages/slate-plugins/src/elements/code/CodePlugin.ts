import { SlatePlugin } from 'types';
import { RenderElementOptions } from '../types';
import { deserializeCode } from './deserializeCode';
import { renderElementCode } from './renderElementCode';

export const CodePlugin = (
  options?: RenderElementOptions & { typeCode?: string }
): SlatePlugin => ({
  renderElement: renderElementCode(options),
  deserialize: deserializeCode(options),
});
