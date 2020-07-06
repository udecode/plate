import { deserializeAlign } from './deserializeAlign';
import { renderElementAlign } from './renderElementAlign';
import { AlignPluginOptions } from './types';

/**
 * Enables support for text alignment, useful to align your content
 * to left, right and center it.
 */
export const AlignPlugin = (options?: AlignPluginOptions) => ({
  renderElement: renderElementAlign(options),
  deserialize: deserializeAlign(options),
});
