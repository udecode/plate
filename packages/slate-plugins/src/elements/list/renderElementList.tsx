import { getRenderElements } from '../../common/utils/getRenderElement';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_LIST } from './defaults';
import { ListRenderElementOptions } from './types';

export const renderElementList = (options?: ListRenderElementOptions) => {
  const { ul, ol, li } = setDefaults(options, DEFAULTS_LIST);

  return getRenderElements([ul, ol, li]);
};
