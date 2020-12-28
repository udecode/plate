import { getRenderElement, setDefaults } from '@udecode/slate-plugins-common';
import { DEFAULTS_IMAGE } from './defaults';
import { ImageRenderElementOptions } from './types';

export const renderElementImage = (options?: ImageRenderElementOptions) => {
  const { img } = setDefaults(options, DEFAULTS_IMAGE);

  return getRenderElement(img);
};
