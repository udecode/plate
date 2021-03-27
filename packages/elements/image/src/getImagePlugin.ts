import {
  getRenderElement,
  getSlatePluginTypes,
  SlatePlugin,
} from '@udecode/slate-plugins-core';
import { ELEMENT_IMAGE } from './defaults';
import { getImageDeserialize } from './getImageDeserialize';
import { WithImageUploadOptions } from './types';
import { withImageUpload } from './withImageUpload';

/**
 * Enables support for images.
 */
export const getImagePlugin = (
  options?: WithImageUploadOptions
): SlatePlugin => ({
  pluginKeys: ELEMENT_IMAGE,
  renderElement: getRenderElement(ELEMENT_IMAGE),
  deserialize: getImageDeserialize(),
  voidTypes: getSlatePluginTypes(ELEMENT_IMAGE),
  withOverrides: withImageUpload(options),
});
