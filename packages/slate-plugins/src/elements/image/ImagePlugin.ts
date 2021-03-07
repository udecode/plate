import { setDefaults } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { DEFAULTS_IMAGE, ELEMENT_IMAGE } from './defaults';
import { deserializeImage } from './deserializeImage';
import { renderElementImage } from './renderElementImage';
import { ImagePluginOptions } from './types';

/**
 * Enables support for images.
 */
export const ImagePlugin = (options?: ImagePluginOptions): SlatePlugin => {
  const { img } = setDefaults(options, DEFAULTS_IMAGE);

  return {
    elementKeys: ELEMENT_IMAGE,
    renderElement: renderElementImage(options),
    deserialize: deserializeImage(options),
    voidTypes: [img.type],
  };
};
