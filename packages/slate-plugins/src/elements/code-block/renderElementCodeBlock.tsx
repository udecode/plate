import { getRenderElement } from '../../common/utils/getRenderElement';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_CODE_BLOCK } from './defaults';
import { CodeBlockRenderElementOptions } from './types';

export const renderElementCodeBlock = (
  options?: CodeBlockRenderElementOptions
) => {
  const { code_block } = setDefaults(options, DEFAULTS_CODE_BLOCK);

  return getRenderElement(code_block);
};
