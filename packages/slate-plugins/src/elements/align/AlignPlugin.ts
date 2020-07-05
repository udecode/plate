import { deserializeAlign } from './deserializeAlign';
import { renderElementAlign } from './renderElementAlign';
import { AlignPluginOptions } from './types';

export const AlignPlugin = (options?: AlignPluginOptions) => {
  return {
    renderElement: renderElementAlign(),
    deserialize: deserializeAlign(options),
  };
};
