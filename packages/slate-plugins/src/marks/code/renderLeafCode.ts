import { getRenderLeafDefault } from '../../common/utils/getRenderLeafDefault';
import { DEFAULTS_CODE } from './defaults';
import { CodeRenderLeafOptions } from './types';

export const renderLeafCode = (options?: CodeRenderLeafOptions) =>
  getRenderLeafDefault({
    key: 'code',
    defaultOptions: DEFAULTS_CODE,
    options,
  });
