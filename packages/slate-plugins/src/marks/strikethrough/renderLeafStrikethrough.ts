import { getRenderLeafDefault } from '../../common/utils/getRenderLeafDefault';
import { DEFAULTS_STRIKETHROUGH } from './defaults';
import { StrikethroughRenderLeafOptions } from './types';

export const renderLeafStrikethrough = (
  options?: StrikethroughRenderLeafOptions
) =>
  getRenderLeafDefault({
    key: 'strikethrough',
    defaultOptions: DEFAULTS_STRIKETHROUGH,
    options,
  });
