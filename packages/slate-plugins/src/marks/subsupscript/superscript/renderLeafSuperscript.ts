import { getRenderLeafDefault } from '../../../common/utils/getRenderLeafDefault';
import { DEFAULTS_SUBSUPSCRIPT } from '../defaults';
import { SuperscriptRenderLeafOptions } from './types';

export const renderLeafSuperscript = (options?: SuperscriptRenderLeafOptions) =>
  getRenderLeafDefault({
    key: 'superscript',
    defaultOptions: DEFAULTS_SUBSUPSCRIPT,
    options,
  });
