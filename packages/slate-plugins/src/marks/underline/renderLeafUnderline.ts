import { getRenderLeafDefault } from '../../common/utils/getRenderLeafDefault';
import { DEFAULTS_UNDERLINE } from './defaults';
import { UnderlineRenderLeafOptions } from './types';

export const renderLeafUnderline = (options?: UnderlineRenderLeafOptions) =>
  getRenderLeafDefault({
    key: 'underline',
    defaultOptions: DEFAULTS_UNDERLINE,
    options,
  });
