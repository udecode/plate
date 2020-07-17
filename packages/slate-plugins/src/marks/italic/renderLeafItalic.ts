import { getRenderLeafDefault } from '../../common/utils/getRenderLeafDefault';
import { DEFAULTS_ITALIC } from './defaults';
import { ItalicRenderLeafOptions } from './types';

export const renderLeafItalic = (options?: ItalicRenderLeafOptions) =>
  getRenderLeafDefault({
    key: 'italic',
    defaultOptions: DEFAULTS_ITALIC,
    options,
  });
