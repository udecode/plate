import { getRenderLeafDefault } from '../../common/utils/getRenderLeafDefault';
import { DEFAULTS_HIGHLIGHT } from './defaults';
import { HighlightRenderLeafOptions } from './types';

export const renderLeafHighlight = (options?: HighlightRenderLeafOptions) =>
  getRenderLeafDefault({
    key: 'highlight',
    defaultOptions: DEFAULTS_HIGHLIGHT,
    options,
  });
