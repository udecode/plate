import { getRenderElement } from '../../common/utils/getRenderElement';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_BLOCKQUOTE } from './defaults';
import { BlockquoteRenderElementOptions } from './types';

export const renderElementBlockquote = (
  options?: BlockquoteRenderElementOptions
) => {
  const { blockquote } = setDefaults(options, DEFAULTS_BLOCKQUOTE);

  return getRenderElement(blockquote);
};
