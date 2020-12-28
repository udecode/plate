import { getRenderLeafDefault } from '@udecode/slate-plugins-common';
import { DEFAULTS_SUBSUPSCRIPT } from '../defaults';
import { SuperscriptRenderLeafOptions } from './types';

export const renderLeafSuperscript = (options?: SuperscriptRenderLeafOptions) =>
  getRenderLeafDefault({
    key: 'superscript',
    defaultOptions: DEFAULTS_SUBSUPSCRIPT,
    options,
  });
