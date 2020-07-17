import { getRenderElement } from '../../common/utils/getRenderElement';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_LINK } from './defaults';
import { LinkRenderElementOptions } from './types';

export const renderElementLink = (options?: LinkRenderElementOptions) => {
  const { link } = setDefaults(options, DEFAULTS_LINK);

  return getRenderElement(link);
};
