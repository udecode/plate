import { getRenderElements } from '../../common/utils/getRenderElement';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from './defaults';
import { TableRenderElementOptions } from './types';

export const renderElementTable = (options?: TableRenderElementOptions) => {
  const { table, td, th, tr } = setDefaults(options, DEFAULTS_TABLE);

  return getRenderElements([table, th, tr, td]);
};
