import { getPluginRenderElement } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { KEYS_ALIGN } from './defaults';
import { useDeserializeAlign } from './useDeserializeAlign';

/**
 * Enables support for text alignment, useful to align your content
 * to left, right and center it.
 */
export const AlignPlugin = (): SlatePlugin => ({
  pluginKeys: KEYS_ALIGN,
  renderElement: getPluginRenderElement(KEYS_ALIGN),
  deserialize: useDeserializeAlign(),
});
