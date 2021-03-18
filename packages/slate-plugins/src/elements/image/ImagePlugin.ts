import { getPluginRenderElement } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { ELEMENT_IMAGE } from './defaults';
import { useDeserializeImage } from './useDeserializeImage';

/**
 * Enables support for images.
 */
export const ImagePlugin = (): SlatePlugin => ({
  pluginKeys: ELEMENT_IMAGE,
  renderElement: getPluginRenderElement(ELEMENT_IMAGE),
  deserialize: useDeserializeImage(),
  // voidTypes: [useEditorPluginType(ELEMENT_IMAGE)],
});
