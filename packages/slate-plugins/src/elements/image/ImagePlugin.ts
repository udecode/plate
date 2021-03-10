import { useRenderElement } from '@udecode/slate-plugins-common';
import { SlatePlugin, useEditorType } from '@udecode/slate-plugins-core';
import { ELEMENT_IMAGE } from './defaults';
import { useDeserializeImage } from './useDeserializeImage';

/**
 * Enables support for images.
 */
export const ImagePlugin = (): SlatePlugin => ({
  elementKeys: ELEMENT_IMAGE,
  renderElement: useRenderElement(ELEMENT_IMAGE),
  deserialize: useDeserializeImage(),
  voidTypes: [useEditorType(ELEMENT_IMAGE)],
});
