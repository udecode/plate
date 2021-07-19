import { getRenderElement, PlatePlugin } from '@udecode/plate-core';
import { KEYS_ALIGN } from './defaults';
import { getAlignDeserialize } from './getAlignDeserialize';

/**
 * Enables support for text alignment, useful to align your content
 * to left, right and center it.
 */
export const createAlignPlugin = (): PlatePlugin => ({
  pluginKeys: KEYS_ALIGN,
  renderElement: getRenderElement(KEYS_ALIGN),
  deserialize: getAlignDeserialize(),
});
