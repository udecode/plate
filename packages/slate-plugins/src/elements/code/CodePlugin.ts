import { SlatePlugin } from 'common/types';
import { RenderElementOptions } from 'element';
import { deserializeCode } from './deserializeCode';
import { renderElementCode } from './renderElementCode';

export const CodePlugin = (
  options?: RenderElementOptions & { typeCode?: string }
): SlatePlugin => ({
  renderElement: renderElementCode(options),
  deserialize: deserializeCode(options),
});
