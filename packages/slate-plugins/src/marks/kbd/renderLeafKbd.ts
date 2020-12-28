import { getRenderLeafDefault } from '@udecode/slate-plugins-common';
import { DEFAULTS_KBD } from './defaults';
import { KbdRenderLeafOptions } from './types';

export const renderLeafKbd = (options?: KbdRenderLeafOptions) =>
  getRenderLeafDefault({
    key: 'kbd',
    defaultOptions: DEFAULTS_KBD,
    options,
  });
