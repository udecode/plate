import { setDefaults } from '@udecode/slate-plugins-common';
import { DEFAULTS_LIST } from '../defaults';
import { ListOptions } from '../types';

export const getListTypes = (options?: ListOptions) => {
  const { ul, ol } = setDefaults(options, DEFAULTS_LIST);

  return [ol.type, ul.type];
};
