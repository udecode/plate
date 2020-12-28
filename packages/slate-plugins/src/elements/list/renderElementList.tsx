import { getRenderElements, setDefaults } from '@udecode/slate-plugins-common';
import { DEFAULTS_LIST } from './defaults';
import { ListRenderElementOptions } from './types';

export const renderElementList = (options?: ListRenderElementOptions) => {
  const { ul, ol, li } = setDefaults(options, DEFAULTS_LIST);

  return getRenderElements([ul, ol, li]);
};
