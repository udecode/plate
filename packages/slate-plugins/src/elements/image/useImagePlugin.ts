import {
  usePluginTypes,
  useRenderElement,
} from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { ELEMENT_IMAGE } from './defaults';
import { WithImageUploadOptions } from './types';
import { useDeserializeImage } from './useDeserializeImage';
import { withImageUpload } from './withImageUpload';

/**
 * Enables support for images.
 */
export const useImagePlugin = (
  options?: WithImageUploadOptions
): SlatePlugin => ({
  pluginKeys: ELEMENT_IMAGE,
  renderElement: useRenderElement(ELEMENT_IMAGE),
  deserialize: useDeserializeImage(),
  voidTypes: usePluginTypes(ELEMENT_IMAGE),
  withOverrides: withImageUpload(options),
});
