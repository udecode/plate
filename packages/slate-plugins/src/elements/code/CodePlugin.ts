import { SlatePlugin } from 'common/types';
import { CodePluginOptions } from 'elements/code/types';
import { deserializeCode } from './deserializeCode';
import { renderElementCode } from './renderElementCode';

export const CodePlugin = (options?: CodePluginOptions): SlatePlugin => ({
  renderElement: renderElementCode(options),
  deserialize: deserializeCode(options),
});
