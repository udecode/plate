import { getRenderElement } from '../../common/utils/getRenderElement';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_IMAGE } from './defaults';
import { ImageRenderElementOptions } from './types';

export const renderElementImage = (options?: ImageRenderElementOptions) => {
  const { img } = setDefaults(options, DEFAULTS_IMAGE);

  return getRenderElement(img);
};
