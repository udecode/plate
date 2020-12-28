import { getRenderLeafDefault } from '@udecode/slate-plugins-common';
import { DEFAULTS_ITALIC } from './defaults';
import { ItalicRenderLeafOptions } from './types';

export const renderLeafItalic = (options?: ItalicRenderLeafOptions) =>
  getRenderLeafDefault({
    key: 'italic',
    defaultOptions: DEFAULTS_ITALIC,
    options,
  });
